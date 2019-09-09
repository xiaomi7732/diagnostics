using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Diagnostics.Tools.RuntimeClient;
using Microsoft.Extensions.Logging;

namespace HostedTrace
{
    internal class TraceService : ITraceService
    {
        private readonly ILogger<TraceService> _logger;
        private readonly IProfileService _profileService;
        private readonly ITraceSessionManager _sessionManager;

        public TraceService(IProfileService profileService,
            ITraceSessionManager traceSessionManager,
            ILogger<TraceService> logger)
        {
            _sessionManager = traceSessionManager ?? throw new ArgumentNullException(nameof(traceSessionManager));
            _profileService = profileService ?? throw new ArgumentNullException(nameof(profileService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<ulong> StartAsync(int processId,
            FileInfo output,
            uint buffersize,
            string profile,
            TraceFileFormat format)
        {
            if (output == null)
            {
                throw new ArgumentNullException(nameof(output));
            }

            if (string.IsNullOrEmpty(profile))
            {
                throw new ArgumentNullException(nameof(profile));
            }

            if (processId < 0)
            {
                throw new ArgumentOutOfRangeException(nameof(processId), "Process ID should not be negative.");
            }

            Profile selectedProfile = (await _profileService.LoadProfilesAsync().ConfigureAwait(false))
                   .FirstOrDefault(p => p.Name.Equals(profile, StringComparison.OrdinalIgnoreCase));
            if (selectedProfile == null)
            {
                _logger.LogError($"Invalid profile name: {profile}");
                throw new ArgumentOutOfRangeException(nameof(profile), profile);
            }

            List<Microsoft.Diagnostics.Tools.RuntimeClient.Provider> providerCollection =
                selectedProfile.Providers
                .Select(p => new Microsoft.Diagnostics.Tools.RuntimeClient.Provider(p.Name, p.Keywords, p.EventLevel, p.FilterData))
                .ToList();

            if (providerCollection.Count <= 0)
            {
                throw new InvalidOperationException("No providers were specified to start a trace.");
            }

            PrintProviders(providerCollection);

            var process = Process.GetProcessById(processId);
            var configuration = new SessionConfiguration(
                circularBufferSizeMB: buffersize,
                format: EventPipeSerializationFormat.NetTrace,
                providers: providerCollection);

            ulong sessionId = 0;
            Stream stream = EventPipeClient.CollectTracing(processId, configuration, out sessionId);

            CancellationTokenSource cancellationTokenSource = new CancellationTokenSource();
            if (sessionId == 0)
            {
                throw new InvalidOperationException("Unable to create session.");
            }

            Task running = Task.Run(() =>
            {
                using (var fs = new FileStream(output.FullName, FileMode.Create, FileAccess.Write))
                {
                    var buffer = new byte[16 * 1024];
                    while (true)
                    {
                        int nBytesRead = stream.Read(buffer, 0, buffer.Length);
                        if (nBytesRead <= 0) { break; }
                        fs.Write(buffer, 0, nBytesRead);
                    }
                }
            }, cancellationTokenSource.Token);

            _sessionManager.TryAdd(new ProfileTraceSession()
            {
                ProcessId = processId,
                Id = sessionId,
                Task = running,
                CancellationTokenSource = cancellationTokenSource,
                TraceStream = stream,
            });

            return sessionId;
        }

        public bool Stop(int processId, ulong? sessionId = null)
        {
            try
            {
                TraceSessionId spec = new ProfileTraceSession()
                {
                    ProcessId = processId,
                    Id = sessionId,
                };
                if (_sessionManager.TryRemove(spec, out ProfileTraceSession session))
                {
                    Debug.Assert(session.Id != null, "Returned session should always have an id.");
                    ulong stopResult = EventPipeClient.StopTracing(session.ProcessId, session.Id.Value);
                    if (stopResult != 0)
                    {
                        session.CancellationTokenSource.Cancel();
                        session.TraceStream.Dispose();
                        return true;
                    }
                    else
                    {
                        return false;
                    }
                }
                else
                {
                    // The session might have been removed already.
                    return false;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
                return false;
            }
        }


        [Conditional("DEBUG")]
        private static void PrintProviders(IReadOnlyList<Microsoft.Diagnostics.Tools.RuntimeClient.Provider> providers)
        {
            Console.Out.WriteLine("Enabling the following providers");
            foreach (var provider in providers)
                Console.Out.WriteLine($"\t{provider.ToString()}");
        }
    }
}