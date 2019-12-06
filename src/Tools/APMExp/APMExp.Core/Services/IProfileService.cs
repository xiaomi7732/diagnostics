using System.Collections.Generic;
using System.Threading.Tasks;
using APMExp.Models;

namespace APMExp.Services
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