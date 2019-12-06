using System.IO;
using System.Reflection;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;

namespace APMExp.Backend
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
                    string root = Path.GetDirectoryName(Assembly.GetEntryAssembly().Location);
                    webBuilder.UseContentRoot(root).UseStartup<Startup>().UseUrls("http://*:9400");
                });
    }
}
