using System;
using System.Diagnostics.Tracing;
using System.Text.RegularExpressions;
using Newtonsoft.Json;

namespace HostedTrace
{
    [JsonObject(MemberSerialization = MemberSerialization.OptIn)]
    public class Provider
    {
        // Preserve for serialization / deserialization.
        public Provider()
        {

        }

        public Provider(
            string name,
            ulong keywords = ulong.MaxValue,
            EventLevel eventLevel = EventLevel.Verbose,
            string filterData = null)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                throw new ArgumentNullException(nameof(name));
            }
            Name = name;
            KeywordsHex = string.Format("0x{0:X}", keywords);
            EventLevel = eventLevel;
            FilterData = string.IsNullOrWhiteSpace(filterData) ? null : Regex.Unescape(filterData);
        }

        [JsonProperty("keywordsHex")]
        public string KeywordsHex { get; set; }

        [JsonProperty("eventLevel")]
        public EventLevel EventLevel { get; set; }

        [JsonProperty("name")]
        public string Name { get; set; }

        [JsonProperty("filterData")]
        public string FilterData { get; set; }

        public override string ToString() =>
            $"{Name}:{KeywordsHex}:{(uint)EventLevel}{(FilterData == null ? "" : $":{FilterData}")}";
    }
}