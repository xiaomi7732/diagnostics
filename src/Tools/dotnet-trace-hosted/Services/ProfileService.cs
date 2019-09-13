using System;
using System.Collections.Generic;
using System.Diagnostics.Tracing;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Diagnostics.Tracing.Parsers;
using Newtonsoft.Json;

namespace HostedTrace
{
    internal class ProfileService : IProfileService
    {
        private readonly IProfileRepo _profileRepo;
        public ProfileService(IProfileRepo profileRepo)
        {
            _profileRepo = profileRepo ?? throw new ArgumentNullException(nameof(profileRepo));
        }

        public async Task<Profile> AddProfileAsync(Profile newProfile)
        {
            IEnumerable<Profile> allProfiles = await LoadProfilesAsync().ConfigureAwait(false);
            if (allProfiles.FirstOrDefault(p => string.Equals(p.Name, newProfile.Name, StringComparison.InvariantCultureIgnoreCase)) == null)
            {
                List<Profile> newList = allProfiles.ToList();
                newList.Add(newProfile);
                if (await SaveProfilesAsync(newList).ConfigureAwait(false))
                {
                    return newProfile;
                }
            }
            return null;
        }

        public async Task<bool> DeleteProfileByNameAsync(string profileName)
        {
            List<Profile> allProfiles = (await LoadProfilesAsync().ConfigureAwait(false)).ToList();
            Profile target = allProfiles.FirstOrDefault(p => string.Equals(profileName, p.Name, StringComparison.InvariantCultureIgnoreCase));
            if (target != null)
            {
                allProfiles.Remove(target);
                return await SaveProfilesAsync(allProfiles).ConfigureAwait(false);
            }
            return false;
        }

        public async Task<Profile> UpdateProfileAsync(Profile newProfile)
        {
            if (await DeleteProfileByNameAsync(newProfile.Name).ConfigureAwait(false))
            {
                return await AddProfileAsync(newProfile).ConfigureAwait(false);
            }

            return null;
        }

        public IEnumerable<Profile> GetPreDefinedProfiles()
        {
            return
            new[] {
            new Profile(
                "runtime-basic",
                new Provider[] {
                    new Provider("Microsoft-DotNETCore-SampleProfiler"),
                    new Provider("Microsoft-Windows-DotNETRuntime", (ulong)ClrTraceEventParser.Keywords.Default, EventLevel.Informational),
                },
                "Useful for tracking CPU usage and general runtime information. This the default option if no profile is specified."),
#if DEBUG // Coming soon: Preview6
            new Profile(
                "gc",
                new Provider[] {
                    new Provider("Microsoft-DotNETCore-SampleProfiler"),
                    new Provider(
                        name: "Microsoft-Windows-DotNETRuntime",
                        keywords: (ulong)ClrTraceEventParser.Keywords.GC |
                                  (ulong)ClrTraceEventParser.Keywords.GCHeapSurvivalAndMovement |
                                  (ulong)ClrTraceEventParser.Keywords.Stack |
                                  (ulong)ClrTraceEventParser.Keywords.Jit |
                                  (ulong)ClrTraceEventParser.Keywords.StopEnumeration |
                                  (ulong)ClrTraceEventParser.Keywords.SupressNGen |
                                  (ulong)ClrTraceEventParser.Keywords.Loader |
                                  (ulong)ClrTraceEventParser.Keywords.Exception,
                        eventLevel: EventLevel.Verbose),
                },
                "Tracks allocation and collection performance."),
            new Profile(
                "gc-collect",
                new Provider[] {
                    new Provider("Microsoft-DotNETCore-SampleProfiler"),
                    new Provider(
                        name: "Microsoft-Windows-DotNETRuntime",
                        keywords:   (ulong)ClrTraceEventParser.Keywords.GC |
                                    (ulong)ClrTraceEventParser.Keywords.Exception,
                        eventLevel: EventLevel.Informational),
                },
                "Tracks GC collection only at very low overhead."),
#endif // DEBUG
            new Profile(
                "none",
                null,
                "Tracks nothing. Only providers specified by the --providers option will be available."),
            new Profile("ai-profiler",
                new Provider[]{
                    new Provider("Microsoft-Windows-DotNETRuntime", 0x4c14fccbd, EventLevel.Verbose),
                    new Provider("Microsoft-Windows-DotNETRuntimePrivate",  0x4002000b, EventLevel.Verbose),
                    new Provider("Microsoft-DotNETCore-SampleProfiler", 0x0, EventLevel.Verbose),
                    new Provider("System.Threading.Tasks.TplEventSource", 0x1 | 0x2 | 0x4 | 0x40 | 0x80, EventLevel.Verbose),
                    new Provider("Microsoft-ApplicationInsights-DataRelay", 0xffffffff, EventLevel.Verbose),
                    new Provider("Microsoft-ApplicationInsights-Data", 0xffffffff, EventLevel.Verbose),
                },
                "Providers required to work with AI Profiling"),
        };
        }

        public async Task<IEnumerable<Profile>> LoadProfilesAsync()
        {
            if (_profileRepo.Exists())
            {
                string serialized = await _profileRepo.LoadAsync().ConfigureAwait(false);
                if (!string.IsNullOrEmpty(serialized))
                {
                    return JsonConvert.DeserializeObject<IEnumerable<Profile>>(serialized);
                }
            }
            return GetPreDefinedProfiles();
        }

        public async Task<bool> SaveProfilesAsync(IEnumerable<Profile> profiles)
        {
            try
            {
                string serialized = JsonConvert.SerializeObject(profiles);
                await _profileRepo.SaveAsync(serialized).ConfigureAwait(false);
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }
    }
}