namespace HostedTrace
{
    public interface ITraceSessionManager
    {
        string ListAll();
        bool TryAdd(TraceSessionId session);
        bool TryRemove<T>(TraceSessionId spec, out T session)
            where T : TraceSessionId;
    }
}