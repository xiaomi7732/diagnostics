using System.Collections.Generic;
using System.Diagnostics;
using System.Diagnostics.Tracing;
using System.IO;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Diagnostics.Tools.RuntimeClient;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using ServiceProfiler.EventPipe.Client.EventListeners;

namespace dotnet_repro_activityids
{
    public class Startup
    {
        private Stream stream;
        private TraceSessionListener _listener;
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddApplicationInsightsTelemetry();
            services.AddControllers();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseHttpsRedirection();

            app.UseRouting();

            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });

            _listener = new TraceSessionListener(app.ApplicationServices.GetService<ILogger<TraceSessionListener>>());
            // Enable Profiler
            StartProfiling();
            // ~
        }

        private void StartProfiling()
        {
            Process process = Process.GetCurrentProcess();

            List<Provider> profile = new List<Provider>{
                new Provider("Microsoft-Windows-DotNETRuntime", 0x4c14fccbd, EventLevel.Verbose),
                new Provider("Microsoft-Windows-DotNETRuntimePrivate",  0x4002000b, EventLevel.Verbose),
                new Provider("Microsoft-DotNETCore-SampleProfiler", 0x0, EventLevel.Verbose),
                new Provider("System.Threading.Tasks.TplEventSource", 0x1 | 0x2 | 0x4 | 0x40 | 0x80, EventLevel.Verbose),
                // new Provider("Microsoft-ApplicationInsights-DataRelay", 0xffffffff, EventLevel.Verbose),
                // new Provider("Microsoft-ApplicationInsights-Data", 0xffffffff, EventLevel.Verbose),
            };

            var configuration = new SessionConfiguration(
                circularBufferSizeMB: 250,
                format: EventPipeSerializationFormat.NetTrace,
                providers: profile);

            ulong sessionId = 0;
            stream = EventPipeClient.CollectTracing(process.Id, configuration, out sessionId);
        }


    }
}
