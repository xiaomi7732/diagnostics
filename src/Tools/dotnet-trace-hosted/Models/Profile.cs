using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;

namespace HostedTrace
{
    [JsonObject(MemberSerialization = MemberSerialization.OptIn)]
    public sealed class Profile
    {
        public Profile()
        : this(null, null, null)
        {

        }
        public Profile(string name, IEnumerable<Provider> providers, string description)
        {
            Name = name;
            Providers = providers == null ? new List<Provider>() : new List<Provider>(providers);
            Description = description;
        }

        [JsonProperty("name")]
        public string Name { get; set; }

        [JsonProperty("providers")]
        public IEnumerable<Provider> Providers { get; set; } = new List<Provider>();

        [JsonProperty("description")]
        public string Description { get; set; }
    }
}