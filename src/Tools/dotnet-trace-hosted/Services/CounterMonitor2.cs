using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Threading.Tasks;
using Microsoft.Diagnostics.Tools.Counters;
using Microsoft.Diagnostics.Tools.RuntimeClient;
using Microsoft.Diagnostics.Tracing;

namespace HostedTrace
{
    public class CounterMonitor2 : ICounterMonitor
    {
        CounterConfiguration _configuration;
        private readonly ITraceSessionManager _sessionManager;

        public CounterMonitor2(CounterConfiguration configuration,
            ITraceSessionManager sessionManager
        )
        {
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
            _sessionManager = sessionManager ?? throw new ArgumentNullException(nameof(sessionManager));
        }

        public Task<ulong> StartMonitorAsync(List<string> counterList, int processId, int intervalInSeconds)
        {
            CounterFilter filter = new CounterFilter();

            List<string> providerStringList = new List<string>();
            foreach (string providerName in _configuration.ProviderNames)
            {
                if (KnownData.TryGetProvider(providerName, out CounterProvider provider))
                {
                    string providerString = provider.ToProviderString(_configuration.IntervalInSeconds);
                    providerStringList.Add(providerString);
                    filter.AddFilter(providerName);
                }
            }
            if (providerStringList.Count == 0)
            {
                throw new InvalidOperationException("No proper provider.");
            }
            string providerStrings = string.Join(',', providerStringList);

            Debug.WriteLine("Provider strings: {0}", providerStrings);

            EventPipeEventSource eventSource = RequestTracing(providerStrings, processId, out ulong sessionId);
            if (sessionId > 0)
            {
                MonitorTraceSession monitorTraceSession = new MonitorTraceSession(
                    processId,
                    sessionId,
                    eventSource,
                    filter,
                    _configuration.IntervalInSeconds);
                _sessionManager.TryAdd(monitorTraceSession);
                return Task.FromResult(sessionId);
            }
            else
            {
                throw new InvalidOperationException("Can't start a monitor session");
            }
        }

        public Task<bool> StopMonitorAsync(int processId, ulong sessionId)
        {
            if (_sessionManager.TryRemove(new TraceSessionId() { ProcessId = processId, Id = sessionId }, out MonitorTraceSession targetSession))
            {
                if (targetSession != null)
                {
                    targetSession.Dispose();
                }
                return Task.FromResult(true);
            }
            throw new ArgumentException($"Can't find the session. Pid: {processId}, SessiondId: {sessionId}");
        }

        private EventPipeEventSource RequestTracing(string providerStrings, int processId, out ulong sessionId)
        {
            EventPipeEventSource source = null;
            try
            {
                var configuration = new SessionConfigurationV2(
                                circularBufferSizeMB: 1000,
                                format: EventPipeSerializationFormat.NetTrace,
                                requestRundown: false,
                                providers: Microsoft.Diagnostics.Tools.Trace.Extensions.ToProviders(providerStrings));
                var binaryReader = EventPipeClient.CollectTracing2(processId, configuration, out sessionId);
                source = new EventPipeEventSource(binaryReader);

            }
            catch (EventPipeUnknownCommandException)
            {
                var configuration = new SessionConfiguration(
                                        circularBufferSizeMB: 1000,
                                        format: EventPipeSerializationFormat.NetTrace,
                                        providers: Microsoft.Diagnostics.Tools.Trace.Extensions.ToProviders(providerStrings));
                var binaryReader = EventPipeClient.CollectTracing(processId, configuration, out sessionId);
                source = new EventPipeEventSource(binaryReader);
            }
            return source;
        }


    }
}