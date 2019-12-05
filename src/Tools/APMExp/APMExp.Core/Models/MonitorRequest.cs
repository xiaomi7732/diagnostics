using Newtonsoft.Json;

namespace APMExp.Models
{
    [JsonObject(MemberSerialization = MemberSerialization.OptIn)]
    public class MonitorRequest
    {
        [JsonProperty("processId")]
        public int ProcessId { get; set; }
    }
}