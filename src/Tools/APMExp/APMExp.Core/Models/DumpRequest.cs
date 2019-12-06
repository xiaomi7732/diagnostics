using Newtonsoft.Json;

namespace APMExp.Models
{
    public enum DumpType
    {
        Heap,       // A large and relatively comprehensive dump containing module lists, thread lists, all 
                    // stacks, exception information, handle information, and all memory except for mapped images.
        Mini,        // A small dump containing module lists, thread lists, exception information and all stacks.
    }

    [JsonObject(MemberSerialization = MemberSerialization.OptIn)]
    public class DumpRequest
    {
        [JsonProperty("processId")]
        public int ProcessId { get; set; }

        [JsonProperty("isDiagnostics", DefaultValueHandling = DefaultValueHandling.Populate)]
        public bool IsDiagnostics { get; set; } = false;

        [JsonProperty("dumpType", DefaultValueHandling = DefaultValueHandling.Populate)]
        public DumpType DumpType { get; set; } = DumpType.Heap;
    }
}