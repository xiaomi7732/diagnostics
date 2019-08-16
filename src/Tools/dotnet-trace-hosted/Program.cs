using System.IO;
using System.Reflection;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;

namespace HostedTrace
{
    public class Program
    {
        public static void Main(string[] args)
        {
            CreateHostBuilder(args).Build().Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    // So that the root won't change no matter the caller's folder is.
                    string root = Path.GetDirectoryName(Assembly.GetEntryAssembly().Location);
                    webBuilder.UseContentRoot(root)
                        .UseStartup<Startup>()
                        .UseUrls("http://*:9400");
                });
    }
}
