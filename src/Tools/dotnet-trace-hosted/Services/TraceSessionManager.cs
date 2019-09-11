using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace HostedTrace
{
    public class TraceSessionManager : ITraceSessionManager
    {
        private readonly ConcurrentDictionary<string, TraceSessionId> _sessions;
        private readonly ILogger _logger;

        public TraceSessionManager(ILogger<TraceSessionManager> logger)
        {
            _sessions = new ConcurrentDictionary<string, TraceSessionId>();
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }
        public string ListAll()
        {
            string result = JsonConvert.SerializeObject(_sessions.Values.ToArray());
            _logger.LogDebug(result);
            return result;
        }

        public bool TryAdd(TraceSessionId session)
        {
            string key = $"{session.ProcessId}_{session.Id}";
            return _sessions.TryAdd(key, session);
        }

        private bool TryRemove(ref TraceSessionId session)
        {
            string key = $"{session.ProcessId}_{session.Id}";
            return _sessions.TryRemove(key, out session);
        }

        public bool TryRemove<T>(TraceSessionId spec, out T session)
            where T : TraceSessionId
        {
            // Assuming remove failed.
            TraceSessionId traceSessionId = null;
            session = null;

            // Find the target session by ProcessId or (ProcessId and SessionId)
            KeyValuePair<string, TraceSessionId> target = _sessions.FirstOrDefault(pair => pair.Value.ProcessId == spec.ProcessId && (spec.Id == null || spec.Id == pair.Value.Id));
            if (string.IsNullOrEmpty(target.Key))
            {
                return false;
            }

            // Try remove
            bool result = _sessions.TryRemove(target.Key, out traceSessionId);
            session = (T)traceSessionId;
            return result;
        }

        public T GetSession<T>(TraceSessionId spec) where T : TraceSessionId
        {
            string key = $"{spec.ProcessId}_{spec.Id}";
            return (T)_sessions[key];
        }
    }
}