using System.Threading;
using System.Threading.Tasks;

namespace HostedTrace
{
    public interface IDumpService
    {
        Task<bool> CollectAsync(int processId, bool diag, DumpTypeOption type, CancellationToken cancellationToken);
    }
}