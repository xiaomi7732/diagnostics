using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Diagnostics.Tools.Counters;

namespace HostedTrace
{
    public class MonitorService : IMonitorService
    {
        private readonly CounterMonitor _monitor;
        private CancellationTokenSource _cancellationTokenSource;
        private readonly CounterConfiguration _counterConfiguration;
        public MonitorService(CounterMonitor counterMonitor, CounterConfiguration counterConfiguration)
        {
            _monitor = counterMonitor ?? throw new ArgumentNullException(nameof(counterMonitor));
            _counterConfiguration = counterConfiguration ?? throw new ArgumentNullException(nameof(counterConfiguration));
            _cancellationTokenSource = new CancellationTokenSource();
        }

        public Task<ulong> StartMonitorAsync(int processId)
        {
            _monitor.Update += Update;
            return _monitor.StartMonitorAsync(null, processId, 1);
        }

        public Task StopMonitor(string processId, int sessionId)
        {
            _cancellationTokenSource.Cancel(false);
            _cancellationTokenSource = new CancellationTokenSource();
            return Task.CompletedTask;
        }

        private void Update(object sender, (string, ICounterPayload) data)
        {
            Console.WriteLine("[" + data.Item1 + "] " + data.Item2.GetDisplay() + ":" + data.Item2.GetValue());
        }
    }
}