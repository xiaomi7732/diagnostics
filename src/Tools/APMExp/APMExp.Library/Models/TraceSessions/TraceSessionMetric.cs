namespace APMExp.Models
{
    public class TraceSessionMetric
    {
        public int ProcessId { get; set; }
        public ulong? SessionId { get; set; }
        public string MetricName { get; set; }
        public double MetricValue { get; set; }
    }
}