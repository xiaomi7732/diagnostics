using System.Threading.Tasks;

namespace APMExp.Services
{
    public interface IMonitorService
    {
        Task<ulong> StartMonitorAsync(int processId);
        Task StopMonitorAsync(int processId, ulong sessionId);
    }
}