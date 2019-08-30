using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Microsoft.AspNetCore.Mvc;

namespace HostedTrace
{
    [ApiController]
    [Route("[controller]")]
    public class TraceFilesController : ControllerBase
    {
        private readonly ITraceRepoService _traceRepoService;

        public TraceFilesController(ITraceRepoService traceRepoService)
        {
            _traceRepoService = traceRepoService ?? throw new ArgumentNullException(nameof(traceRepoService));
        }

        [HttpGet]
        public ActionResult<IEnumerable<string>> List()
        {
            try
            {
                return Ok(_traceRepoService.ListTraceFiles().Select(file =>
                {
                    file.FullPath = "redacted";
                    return file;
                }));
            }
            catch (Exception ex)
            {
                return Conflict(ex.ToString());
            }
        }

        [HttpGet("{fileName}")]
        public IActionResult Download(string fileName)
        {
            try
            {
                Stream stream = _traceRepoService.GetFileStream(fileName);
                if (stream == null)
                {
                    return NotFound();
                }
                return File(stream, "application/octet-stream");
            }
            catch (Exception ex)
            {
                return Conflict(ex.ToString());
            }
        }

        [HttpPost()]
        public IActionResult ConvertToSpeedscope([FromBody]TraceFile target)
        {
            try
            {
                _traceRepoService.ConvertFormat(target.FileName, TraceFileFormat.Speedscope);
                return Ok();
            }
            catch (ArgumentException ex)
            {
                if (ex.Message == "Invalid samples, two samples can not happen at the same time.")
                {
                    return NotFound(new
                    {
                        Error = ex.Message,
                    });
                }
                else
                {
                    throw;
                }
            }
            catch (Exception ex)
            {
                return Conflict(new
                {
                    Error = ex.Message,
                    Details = ex.ToString(),
                });
            }
        }
    }
}