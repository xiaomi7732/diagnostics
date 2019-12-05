using Newtonsoft.Json;

namespace APMExp.Models.TraceSessions
{
    public enum TraceSessionType
    {
        Profile,
        Monitor,
    }

    [JsonObject(MemberSerialization = MemberSerialization.OptIn)]
    public class TraceSessionId
    {
        public TraceSessionId() : this(default, default) { }

        public TraceSessionId(int processId, ulong sessionId)
        {
            ProcessId = processId;
            Id = sessionId;
        }

        [JsonProperty("processId")]
        public int ProcessId { get; set; }

        [JsonProperty("sessionId")]
        public ulong? Id { get; set; }

        [JsonProperty("type", DefaultValueHandling = DefaultValueHandling.Populate)]
        public TraceSessionType Type { get; set; } = TraceSessionType.Profile;
    }
}