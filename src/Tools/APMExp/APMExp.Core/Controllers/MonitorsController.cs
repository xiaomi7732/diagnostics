using System;
using System.Threading.Tasks;
using APMExp.Models;
using APMExp.Models.TraceSessions;
using APMExp.Services;
using Microsoft.AspNetCore.Mvc;

namespace APMExp.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class MonitorsController : ControllerBase
    {
        private readonly IMonitorService _monitorService;
        private readonly ITraceSessionManager _sessionManager;

        public MonitorsController(IMonitorService monitorService, ITraceSessionManager sessionManager)
        {
            this._monitorService = monitorService ?? throw new ArgumentNullException(nameof(monitorService));
            this._sessionManager = sessionManager ?? throw new ArgumentNullException(nameof(sessionManager));
        }

        [HttpGet("{processId}/{sessionId}")]
        public ActionResult GetReport(int processId, ulong sessionId)
        {
            var targetSession = _sessionManager.GetSession<MonitorTraceSession>(new TraceSessionId(processId, sessionId));
            if (targetSession != null)
            {
                return Ok(targetSession.GetMetrics());
            }
            else
            {
                return NotFound();
            }
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