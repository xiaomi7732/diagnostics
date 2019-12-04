using System.Collections.Generic;

namespace APMExp.Models.Counters
{
    public class CounterConfiguration
    {
        public int IntervalInSeconds { get; set; } = 1;
        public List<string> ProviderNames { get; set; } = new List<string>
        {
            "System.Runtime",
            "Microsoft.AspNetCore.Hosting"
        };
    }
}