using Newtonsoft.Json;

namespace HostedTrace
{
    [JsonObject(MemberSerialization = MemberSerialization.OptIn)]
    public class TraceFile
    {
        public string FullPath { get; set; }

        [JsonProperty("fileName")]
        public string FileName { get; set; }
    }
}