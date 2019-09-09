using Newtonsoft.Json;

namespace HostedTrace
{
    public enum TraceSessionType
    {
        Profile,
        Monitor,
    }

    [JsonObject(MemberSerialization = MemberSerialization.OptIn)]
    public class TraceSessionId
    {
        [JsonProperty("processId")]
        public int ProcessId { get; set; }

        [JsonProperty("sessionId")]
        public ulong? Id { get; set; }

        [JsonProperty("type", DefaultValueHandling = DefaultValueHandling.Populate)]
        public TraceSessionType Type { get; set; } = TraceSessionType.Profile;
    }
}