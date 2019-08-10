using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Diagnostics.Tools.RuntimeClient;

namespace HostedTrace.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ProcessesController : ControllerBase
    {
        [HttpGet]
        public IEnumerable<ProcessInfo> Get()
        {
            Process current = Process.GetCurrentProcess();
            List<ProcessInfo> processInfos =
                EventPipeClient.ListAvailablePorts()
                    .Select(id => GetProcessById(id))
                    .Where(p => p != null)
                    .Select(p => new ProcessInfo()
                    {
                        Id = p.Id,
                        Name = p.ProcessName + (p.Id == current.Id ? " [Dotnet-Trace]" : ""),
                    }).ToList();
            return processInfos;
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