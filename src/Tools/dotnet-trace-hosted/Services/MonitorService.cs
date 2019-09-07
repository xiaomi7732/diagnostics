using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Diagnostics.Tools.Counters;

namespace HostedTrace
{
    public class MonitorService : IMonitorService
    {
        private readonly ICounterMonitor _monitor;
        public MonitorService(ICounterMonitor counterMonitor, CounterConfiguration counterConfiguration)
        {
            _monitor = counterMonitor ?? throw new ArgumentNullException(nameof(counterMonitor));
        }

        public Task<ulong> StartMonitorAsync(int processId)
        {
            _monitor.Update += Update;
            return _monitor.StartMonitorAsync(null, processId, 1);
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