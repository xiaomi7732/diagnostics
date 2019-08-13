using System.Collections.Generic;

namespace HostedTrace
{
    public interface ITraceSessionManager
    {
        string ListAll();
        bool TryAdd(TraceSession session);
        bool TryRemove(TraceSessionId spec, out TraceSession session);
    }
}