using Microsoft.Diagnostics.Tracing;

namespace HostedTrace
{
    public class MonitorTraceSession : TraceSessionId
    {
        public EventPipeEventSource EventSource { get; set; }

    }
}