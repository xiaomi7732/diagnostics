using System;
using APMExp.Models;

namespace APMExp
{
    public class APMExpOptions
    {
        public Action<TraceSessionMetric> OnTraceSessionMetricReport { get; private set; }
        public APMExpOptions(Action<TraceSessionMetric> onMetricReport)
        {
            OnTraceSessionMetricReport = onMetricReport;
        }
    }
}