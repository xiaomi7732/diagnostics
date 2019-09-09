using System.Threading.Tasks;

namespace HostedTrace
{
    public interface IMonitorService
    {
        Task<ulong> StartMonitorAsync(int processId);
        Task StopMonitorAsync(int processId, ulong sessionId);
    }
}