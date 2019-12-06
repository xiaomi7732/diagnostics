using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using APMExp.Models;
using APMExp.Services;
using Microsoft.AspNetCore.Mvc;

namespace APMExp.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ProfilesController : ControllerBase
    {
        private readonly IProfileService _profileService;

        public ProfilesController(IProfileService profileService)
        {
            _profileService = profileService ?? throw new ArgumentNullException(nameof(profileService));
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Profile>>> Get()
        {
            IEnumerable<Profile> profiles = await _profileService.LoadProfilesAsync().ConfigureAwait(false);
            return Ok(profiles);
        }

        [HttpPost]
        public async Task<ActionResult> AddAsync([FromBody] Profile newProfile)
        {
            try
            {
                Profile newInstance = await _profileService.AddProfileAsync(newProfile).ConfigureAwait(false);
                if (newInstance != null)
                {
                    return Created("", newInstance);
                }

                return Conflict();
            }
            catch (Exception ex)
            {
                return Conflict(ex.ToString());
            }
        }

        [HttpDelete("{name}")]
        public async Task<ActionResult> DeleteAsync(string name)
        {
            if (await _profileService.DeleteProfileByNameAsync(name).ConfigureAwait(false))
            {
                return NoContent();
            }
            return Conflict();
        }

        [HttpPut("{name}")]
        public async Task<ActionResult> UpdateAsync(string name, [FromBody] Profile newProfile)
        {
            if (!string.Equals(name, newProfile.Name, StringComparison.InvariantCultureIgnoreCase))
            {
                return ValidationProblem();
            }

            Profile newInstance = await _profileService.UpdateProfileAsync(newProfile).ConfigureAwait(false);
            if (newInstance != null)
            {
                return Ok(newInstance);
            }

            return Conflict();
        }
    }
}