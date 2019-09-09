using System;
using System.Threading.Tasks;
using Microsoft.Diagnostics.Tools.Counters;

namespace HostedTrace
{
    public class MonitorService : IMonitorService
    {
        private readonly ICounterMonitor _monitor;
        public MonitorService(ICounterMonitor counterMonitor)
        {
            _monitor = counterMonitor ?? throw new ArgumentNullException(nameof(counterMonitor));
        }

        public async Task<ulong> StartMonitorAsync(int processId)
        {
            _monitor.Update += Update;
            ulong sessionId = await _monitor.StartMonitorAsync(null, processId, 1).ConfigureAwait(false);
            return sessionId;
        }

        public Task StopMonitorAsync(int processId, ulong sessionId)
        {
            _monitor.Update -= Update;
            return _monitor.StopMonitorAsync(processId, sessionId);
        }

        private void Update(object sender, (string, ICounterPayload) data)
        {

        }
    }
}