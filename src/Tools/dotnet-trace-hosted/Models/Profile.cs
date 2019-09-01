using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;

namespace HostedTrace
{
    [JsonObject(MemberSerialization = MemberSerialization.OptIn)]
    public sealed class Profile
    {
        public Profile(string name, IEnumerable<Provider> providers, string description)
        {
            Name = name;
            Providers = providers == null ? Enumerable.Empty<Provider>() : new List<Provider>(providers).AsReadOnly();
            Description = description;
        }

        [JsonProperty("name")]
        public string Name { get; }

        [JsonProperty("providers")]
        public IEnumerable<Provider> Providers { get; }

        [JsonProperty("description")]
        public string Description { get; }
    }
}