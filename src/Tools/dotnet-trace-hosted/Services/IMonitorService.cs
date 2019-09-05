using System.Threading.Tasks;

namespace HostedTrace
{
    public interface IMonitorService
    {
        Task<int> StartMonitorAsync(int processId);
        Task StopMonitor(string processId, int sessionId);
    }
}