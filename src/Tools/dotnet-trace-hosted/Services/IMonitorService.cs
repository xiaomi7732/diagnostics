using System.Threading.Tasks;

namespace HostedTrace
{
    public interface IMonitorService
    {
        Task<ulong> StartMonitorAsync(int processId);
        Task StopMonitorAsync(string processId, int sessionId);
    }
}