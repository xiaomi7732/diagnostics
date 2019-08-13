using System.Collections.Generic;
using System.Linq;
using Microsoft.Diagnostics.Tools.RuntimeClient;

namespace HostedTrace
{
    public sealed class Profile
    {
        public Profile(string name, IEnumerable<Provider> providers, string description)
        {
            Name = name;
            Providers = providers == null ? Enumerable.Empty<Provider>() : new List<Provider>(providers).AsReadOnly();
            Description = description;
        }

        public string Name { get; }

        public IEnumerable<Provider> Providers { get; }

        public string Description { get; }
    }
}