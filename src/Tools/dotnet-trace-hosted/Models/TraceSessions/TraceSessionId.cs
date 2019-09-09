using Newtonsoft.Json;

namespace HostedTrace
{
    public enum TraceSessionType
    {
        Profile,
        Monitor,
    }

    [JsonObject(MemberSerialization = MemberSerialization.OptIn)]
    public abstract class TraceSessionId
    {
        [JsonProperty("processId")]
        public int ProcessId { get; set; }

        [JsonProperty("sessionId")]
        public ulong? Id { get; set; }

        public abstract TraceSessionType Type { get; }
    }
}