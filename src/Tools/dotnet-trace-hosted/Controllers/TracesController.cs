using System;
using System.IO;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Diagnostics.Tools.RuntimeClient;
using Microsoft.Extensions.Logging;

namespace HostedTrace.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class TracesController : ControllerBase
    {
        private readonly ITraceService _traceService;
        private ILogger<TracesController> _logger;

        public TracesController(
            ITraceService traceService,
            ILogger<TracesController> logger)
        {
            _traceService = traceService ?? throw new ArgumentNullException(nameof(traceService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        [HttpPost]
        public ActionResult<ulong> Start([FromBody] TraceRequest request)
        {
            _logger.LogDebug("Start a Trace . . .");
            try
            {
                string output = Path.Combine(Path.GetTempPath(), "TestProfiling" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".nettrace");
                FileInfo outputFileInfo = new FileInfo(output);
                ulong sessionId = _traceService.Start(request.ProcessId, outputFileInfo, 256, "ai-profiler", TraceFileFormat.NetTrace);
                return Ok(sessionId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
                return Conflict();
            }
        }

        [HttpDelete("{id}")]
        public ActionResult<bool> Stop(int id, [FromQuery(Name = "sid")]ulong sessionId)
        {
            try
            {
                if (_traceService.Stop(id, sessionId))
                {
                    return NoContent();
                }
                else
                {
                    return Conflict(1);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"[ERROR] {ex.ToString()}");
                return Conflict(ex.ToString());
            }
        }
    }
}