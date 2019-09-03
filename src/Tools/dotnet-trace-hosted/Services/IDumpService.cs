using System.Threading;
using System.Threading.Tasks;
using static Microsoft.Diagnostics.Tools.Dump.Dumper;

namespace HostedTrace
{
    public interface IDumpService
    {
        Task<bool> CollectAsync(int processId, bool diag, DumpTypeOption type, CancellationToken cancellationToken);
    }
}