using Newtonsoft.Json;

namespace HostedTrace
{
    [JsonObject(MemberSerialization = MemberSerialization.OptIn)]
    public class MonitorRequest
    {
        [JsonProperty("processId")]
        public int ProcessId { get; set; }
    }
}