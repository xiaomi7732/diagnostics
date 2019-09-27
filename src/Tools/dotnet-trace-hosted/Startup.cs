using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Diagnostics.Tools.Dump;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace HostedTrace
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddApplicationInsightsTelemetry();
            services.AddSignalR();
            services.AddControllers();
            services.AddScoped<IProfileService, ProfileService>();
            services.AddScoped<ITraceService, TraceService>();
            services.AddSingleton<ITraceSessionManager, TraceSessionManager>();
            services.AddScoped<ITraceRepoService, TraceRepoService>();
            services.AddScoped<IProfileRepo, ProfileRepo>();
            services.AddScoped<Dumper>();
            services.AddScoped<IDumpService, DumpService>();
            services.AddSingleton<CounterConfiguration>(new CounterConfiguration());
            services.AddSingleton<ICounterMonitor, CounterMonitor2>();
            services.AddSingleton<IMonitorService, MonitorService>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseCors(opt => opt.WithOrigins("http://localhost:9400", "http://localhost:3000").AllowAnyMethod().AllowAnyHeader().AllowCredentials());
                app.UseDeveloperExceptionPage();
            }
            var defaultFileOption = new DefaultFilesOptions();
            defaultFileOption.DefaultFileNames.Clear();
            defaultFileOption.DefaultFileNames.Add("index.html");
            app.UseDefaultFiles(defaultFileOption);
            app.UseStaticFiles();

            app.UseRouting();

            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
                endpoints.MapHub<CounterHub>("/counterHub");
            });
        }
    }
}
