using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace HostedTrace
{
    [ApiController]
    [Route("[controller]")]
    public class MonitorsController : ControllerBase
    {
        private readonly IMonitorService _monitorService;

        public MonitorsController(IMonitorService monitorService)
        {
            this._monitorService = monitorService;
        }

        [HttpPost]
        public async Task<ActionResult> StartAsync([FromBody]MonitorRequest requestParam)
        {
            ulong sessionId = await _monitorService.StartMonitorAsync(requestParam.ProcessId).ConfigureAwait(false);
            return Ok(sessionId);
        }

        [HttpDelete]
        public async Task<ActionResult> StopAsync([FromBody]TraceSessionId traceSessionId)
        {
            try
            {
                await _monitorService.StopMonitorAsync(traceSessionId.ProcessId, traceSessionId.Id.Value);
                return NoContent();
            }
            catch (Exception ex)
            {
                return Conflict(ex.ToString());
            }
        }
    }
}