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
            services.AddControllers();
            services.AddScoped<IProfileService, ProfileService>();
            services.AddScoped<ITraceService, TraceService>();
            services.AddSingleton<ITraceSessionManager, TraceSessionManager>();
            services.AddScoped<ITraceRepoService, TraceRepoService>();
            services.AddScoped<IProfileRepo, ProfileRepo>();
            services.AddScoped<Dumper>();
            services.AddScoped<IDumpService, DumpService>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseCors(opt => opt.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
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
            });
        }
    }
}
