using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;

namespace HostedTrace.Controllers
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
        public ActionResult<IEnumerable<Profile>> Get()
        {
            return Ok(_profileService.GetPreDefinedProfiles());
        }
    }
}