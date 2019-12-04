using Newtonsoft.Json;

namespace APMExp.Models
{
    [JsonObject(MemberSerialization = MemberSerialization.OptIn)]
    public class TraceFile
    {
        public string FullPath { get; set; }

        [JsonProperty("fileName")]
        public string FileName { get; set; }

        [JsonProperty("sizeInBytes")]
        public ulong SizeInBytes { get; set; }
    }
}