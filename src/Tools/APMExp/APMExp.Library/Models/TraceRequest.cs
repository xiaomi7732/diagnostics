namespace APMExp.Models
{
    public class TraceRequest
    {
        public int ProcessId { get; set; }
        public uint? BufferSizeMB { get; set; }
        public string Profile { get; set; } = "ai-profiler";
    }
}