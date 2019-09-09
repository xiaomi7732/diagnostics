using Microsoft.Diagnostics.Tracing;

namespace HostedTrace
{
    public class MonitorTraceSession : TraceSession
    {
        public EventPipeEventSource EventSource { get; set; }

        public override TraceSessionType Type { get; } = TraceSessionType.Monitor;
    }
}