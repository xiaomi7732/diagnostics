using System.Collections.Generic;
using System.Linq;

namespace APMExp.Models.Counters
{
    public class CounterProvider
    {
        public string Name { get; }
        public string Description { get; }
        public string Keywords { get; }
        public string Level { get; }
        public Dictionary<string, CounterProfile> Counters { get; }

        public CounterProvider(string name, string description, string keywords, string level, IEnumerable<CounterProfile> counters)
        {
            Name = name;
            Description = description;
            Keywords = keywords;
            Level = level;
            Counters = new Dictionary<string, CounterProfile>();
            foreach (CounterProfile counter in counters)
            {
                Counters.Add(counter.Name, counter);
            }
        }

        public string TryGetDisplayName(string counterName)
        {
            if (Counters.ContainsKey(counterName))
                return Counters[counterName].DisplayName;
            return null;
        }

        public string ToProviderString(int interval)
        {
            return $"{Name}:{Keywords}:{Level}:EventCounterIntervalSec={interval}";
        }

        public static string SerializeUnknownProviderName(string unknownCounterProviderName, int interval)
        {
            return $"{unknownCounterProviderName}:ffffffff:4:EventCounterIntervalSec={interval}";
        }

        public IReadOnlyList<CounterProfile> GetAllCounters() => Counters.Values.ToList();

    }
}