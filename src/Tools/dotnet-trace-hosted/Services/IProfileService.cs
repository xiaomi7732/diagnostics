using System.Collections.Generic;
namespace HostedTrace
{
    public interface IProfileService
    {
        IEnumerable<Profile> GetPreDefinedProfiles();
    }
}