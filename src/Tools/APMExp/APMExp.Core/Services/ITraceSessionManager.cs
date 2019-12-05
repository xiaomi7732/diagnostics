using APMExp.Models.TraceSessions;

namespace APMExp.Services
{
    public interface ITraceSessionManager
    {
        string ListAll();
        bool TryAdd(TraceSessionId session);
        bool TryRemove<T>(TraceSessionId spec, out T session)
            where T : TraceSessionId;

        T GetSession<T>(TraceSessionId spec)
            where T : TraceSessionId;
    }
}