using System.Collections.Generic;
using System.Diagnostics.Tracing;
using Microsoft.Diagnostics.Tools.RuntimeClient;
using Microsoft.Diagnostics.Tracing.Parsers;

namespace HostedTrace
{
    internal class ProfileService : IProfileService
    {
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
                new Profile("ai-profiler",new Provider[]{
                    new Provider("Microsoft-Windows-DotNETRuntime", 0x4c14fccbd, EventLevel.Verbose),
                    new Provider("Microsoft-Windows-DotNETRuntimePrivate",  0x4002000b, EventLevel.Verbose),
                    new Provider("Microsoft-DotNETCore-SampleProfiler", 0x0, EventLevel.Verbose),
                    new Provider("System.Threading.Tasks.TplEventSource", 0x1 | 0x2 | 0x4 | 0x40 | 0x80, EventLevel.Verbose),
                    new Provider("Microsoft-ApplicationInsights-DataRelay", 0xffffffff, EventLevel.Verbose),
                }, 
                "Providers required to work with AI Profiling"),
        };
        }
    }
}