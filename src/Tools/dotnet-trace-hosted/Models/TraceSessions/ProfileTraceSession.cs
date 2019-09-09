using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace HostedTrace
{
    public class ProfileTraceSession : TraceSession
    {
        public Task Task { get; set; }
        public CancellationTokenSource CancellationTokenSource { get; set; }
        public Stream TraceStream { get; set; }
        public override TraceSessionType Type { get; } = TraceSessionType.Profile;
    }
}