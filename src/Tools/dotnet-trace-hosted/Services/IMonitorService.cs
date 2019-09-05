using System.Threading.Tasks;

namespace HostedTrace
{
    public interface IMonitorService
    {
        Task<ulong> StartMonitorAsync(int processId);
        Task StopMonitor(string processId, int sessionId);
    }
}