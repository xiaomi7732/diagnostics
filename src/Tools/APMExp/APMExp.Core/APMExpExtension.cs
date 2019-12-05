using System;
using APMExp;
using APMExp.Models;
using APMExp.Models.Counters;
using APMExp.Services;

namespace Microsoft.Extensions.DependencyInjection
{
    public static class APMExpExtension
    {
        public static void AddAPMExp(this IServiceCollection services, APMExpOptions options)
        {
            services.AddScoped<IProfileService, ProfileService>();
            services.AddScoped<ITraceService, TraceService>();
            services.AddSingleton<ITraceSessionManager, TraceSessionManager>();
            services.AddScoped<ITraceRepoService, TraceRepoService>();
            services.AddScoped<IProfileRepo, ProfileRepo>();
            services.AddScoped<IDumpService, DumpService>();
            services.AddSingleton<CounterConfiguration>(new CounterConfiguration());
            services.AddSingleton<KnownCounterProvider>(KnownCounterProvider.Instance);
            services.AddSingleton<ICounterMonitor>(p =>
            {
                Action<TraceSessionMetric> onMetricReport = options?.OnTraceSessionMetricReport;
                return new CounterMonitor2(p.GetRequiredService<CounterConfiguration>(),
                    p.GetRequiredService<ITraceSessionManager>(),
                    p.GetRequiredService<KnownCounterProvider>(),
                    onMetricReport);
            });
            services.AddSingleton<IMonitorService, MonitorService>();
        }
    }
}