using Microsoft.Diagnostics.Tracing;

namespace HostedTrace
{
    public class MonitorTraceSession : TraceSessionId
    {
        public MonitorTraceSession()
        {
            this.Type = TraceSessionType.Monitor;
        }
        
        public EventPipeEventSource EventSource { get; set; }
    }
}