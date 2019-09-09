using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace HostedTrace
{
    public class ProfileTraceSession : TraceSessionId
    {
        public ProfileTraceSession()
        {
            this.Type = TraceSessionType.Profile;
        }

        public Task Task { get; set; }
        public CancellationTokenSource CancellationTokenSource { get; set; }
        public Stream TraceStream { get; set; }
    }
}