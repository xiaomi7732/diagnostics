using System.Collections.Generic;
using System.Threading.Tasks;

namespace HostedTrace
{
    public interface ICounterMonitor
    {
        Task<ulong> StartMonitorAsync(List<string> counterList, int processId, int intervalInSeconds);
        Task<bool> StopMonitorAsync(int processId, ulong sessionId);
    }
}