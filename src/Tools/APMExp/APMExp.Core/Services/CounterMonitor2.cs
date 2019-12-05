using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Threading.Tasks;
using APMExp.Models;
using APMExp.Models.Counters;
using APMExp.Models.TraceSessions;
using Microsoft.Diagnostics.Tools.RuntimeClient;
using Microsoft.Diagnostics.Tracing;

namespace APMExp.Services
{
    public class CounterMonitor2 : ICounterMonitor
    {
        private readonly KnownCounterProvider _knownCounterProvider;
        CounterConfiguration _configuration;
        private readonly ITraceSessionManager _sessionManager;
        private readonly Action<TraceSessionMetric> _onMetricReport;
        public CounterMonitor2(CounterConfiguration configuration,
            ITraceSessionManager sessionManager,
            KnownCounterProvider knownCounterProvider,
            Action<TraceSessionMetric> onMetricReport)
        {
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
            _sessionManager = sessionManager ?? throw new ArgumentNullException(nameof(sessionManager));
            _knownCounterProvider = knownCounterProvider ?? throw new ArgumentNullException(nameof(knownCounterProvider));
            _onMetricReport = onMetricReport;
        }

        public Task<ulong> StartMonitorAsync(List<string> counterList, int processId, int intervalInSeconds)
        {
            CounterFilter filter = new CounterFilter();

            List<string> providerStringList = new List<string>();
            foreach (string providerName in _configuration.ProviderNames)
            {
                if (_knownCounterProvider.TryGetProvider(providerName, out CounterProvider provider))
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
                if (_onMetricReport != null)
                {
                    monitorTraceSession.Report += this._onMetricReport;
                }
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
                    if (this._onMetricReport != null)
                    {
                        targetSession.Report -= this._onMetricReport;
                    }
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
                                providers: APMExp.Services.Extensions.ToProviders(providerStrings));
                var binaryReader = EventPipeClient.CollectTracing2(processId, configuration, out sessionId);
                source = new EventPipeEventSource(binaryReader);

            }
            catch (EventPipeUnknownCommandException)
            {
                var configuration = new SessionConfiguration(
                                        circularBufferSizeMB: 1000,
                                        format: EventPipeSerializationFormat.NetTrace,
                                        providers: APMExp.Services.Extensions.ToProviders(providerStrings));
                var binaryReader = EventPipeClient.CollectTracing(processId, configuration, out sessionId);
                source = new EventPipeEventSource(binaryReader);
            }
            return source;
        }


    }
}