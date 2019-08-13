using Newtonsoft.Json;

namespace HostedTrace
{
    [JsonObject(MemberSerialization=MemberSerialization.OptIn)]
    public class TraceSessionId
    {
        [JsonProperty("processId")]
        public int ProcessId { get; set; }

        [JsonProperty("sessionId")]
        public ulong? Id { get; set; }
    }
}