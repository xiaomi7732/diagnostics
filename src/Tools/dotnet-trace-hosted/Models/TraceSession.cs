using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace HostedTrace
{

    public class TraceSession : TraceSessionId
    {
        public Task Task { get; set; }
        public CancellationTokenSource CancellationTokenSource { get; set; }
        public Stream TraceStream { get; set; }
    }
}