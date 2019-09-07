using System;
using System.Threading.Tasks;
using Microsoft.Diagnostics.Tools.Counters;

namespace HostedTrace
{
    public class MonitorService : IMonitorService
    {
        private readonly ICounterMonitor _monitor;
        private readonly ITraceSessionManager _sessionManager;

        public MonitorService(ICounterMonitor counterMonitor, ITraceSessionManager sessionManager)
        {
            _monitor = counterMonitor ?? throw new ArgumentNullException(nameof(counterMonitor));
            _sessionManager = sessionManager ?? throw new ArgumentNullException(nameof(sessionManager));
        }

        public async Task<ulong> StartMonitorAsync(int processId)
        {
            _monitor.Update += Update;
            ulong sessionId = await _monitor.StartMonitorAsync(null, processId, 1).ConfigureAwait(false);
            TraceSession newTraceSession = new TraceSession()
            {
                ProcessId = processId,
                Id = sessionId,
            };
            if (_sessionManager.TryAdd(newTraceSession))
            {
                return sessionId;
            }
            return 0;
        }

        public Task StopMonitorAsync(string processId, int sessionId)
        {
            return _monitor.StopMonitorAsync();
        }

        private void Update(object sender, (string, ICounterPayload) data)
        {

        }
    }
}