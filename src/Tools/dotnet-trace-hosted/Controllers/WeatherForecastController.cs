using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Diagnostics.Tools.RuntimeClient;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace HostedTrace.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class WeatherForecastController : ControllerBase
    {
        private static readonly string[] Summaries = new[]
        {
            "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
        };

        private readonly ILogger<WeatherForecastController> _logger;

        public WeatherForecastController(ILogger<WeatherForecastController> logger)
        {
            _logger = logger;
        }

        [HttpGet]
        public IEnumerable<string> Get()
        {
            var processes = EventPipeClient.ListAvailablePorts()
                .Select(p => GetProcessById(p))
                .Where(p => p != null)
                .OrderBy(p => p.ProcessName)
                .ThenBy(p => p.Id)
                .Select(p => $"{p.ProcessName} - {p.Id}");

            _logger.LogInformation(string.Join(Environment.NewLine, processes));

            return processes.ToList();
        }

        private static Process GetProcessById(int processId)
        {
            try
            {
                return Process.GetProcessById(processId);
            }
            catch (ArgumentException)
            {
                return null;
            }
        }
    }
}
