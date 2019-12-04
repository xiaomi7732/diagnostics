using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace APMExp.Backend
{
    public class Startup
    {
        private IHubContext<CounterHub> _hubContext;

        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddSignalR();
            services.AddControllers();

            services.AddAPMExp(new APMExpOptions(metric =>
            {
                _hubContext?.Clients.All.SendAsync("UpdateCounterAsync", metric.ProcessId, metric.SessionId, metric.MetricName, metric.MetricValue);
            }));
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseCors(opt => opt.WithOrigins("http://localhost:9400", "http://localhost:3000").AllowAnyMethod().AllowAnyHeader().AllowCredentials());
                app.UseDeveloperExceptionPage();
            }

            app.UseHttpsRedirection();

            app.UseRouting();

            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
                endpoints.MapHub<CounterHub>("/counterHub");
            });

            _hubContext = app.ApplicationServices.GetRequiredService<IHubContext<CounterHub>>();
        }
    }
}
