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
        private readonly ConcurrentDictionary<string, TraceSession> _sessions;
        private readonly ILogger _logger;

        public TraceSessionManager(ILogger<TraceSessionManager> logger)
        {
            _sessions = new ConcurrentDictionary<string, TraceSession>();
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }
        public string ListAll()
        {
            string result = JsonConvert.SerializeObject(_sessions.Values.ToArray());
            _logger.LogDebug(result);
            return result;
        }

        public bool TryAdd(TraceSession session)
        {
            string key = $"{session.ProcessId}_{session.Id}";
            return _sessions.TryAdd(key, session);
        }

        public bool TryRemove(ref TraceSession session)
        {
            string key = $"{session.ProcessId}_{session.Id}";
            return _sessions.TryRemove(key, out session);
        }

        public bool TryRemove(TraceSessionId spec, out TraceSession session)
        {
            // Assuming remove failed.
            session = null;

            // Find the target session by ProcessId or ProcessId+SessionId
            KeyValuePair<string, TraceSession>? target = _sessions.FirstOrDefault(pair => pair.Value.ProcessId == spec.ProcessId && (spec.Id < 0 || spec.Id == pair.Value.Id));
            if (target == null || !target.HasValue)
            {
                return false;
            }

            // Try remove
            return _sessions.TryRemove(target.Value.Key, out session);
        }
    }
}