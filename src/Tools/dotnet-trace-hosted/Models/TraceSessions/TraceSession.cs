namespace HostedTrace
{
    public abstract class TraceSession : TraceSessionId
    {
        public abstract TraceSessionType Type { get; }
    }
}