using System.Collections.Generic;
using System.Threading.Tasks;

namespace HostedTrace
{
    public interface IProfileService
    {
        IEnumerable<Profile> GetPreDefinedProfiles();
        Task<IEnumerable<Profile>> LoadProfilesAsync();

        Task<Profile> AddProfileAsync(Profile newProfile);
        Task<bool> DeleteProfileByNameAsync(string profileName);
        Task<Profile> UpdateProfileAsync(Profile newProfile);

        Task<bool> SaveProfilesAsync(IEnumerable<Profile> profiles);
    }
}