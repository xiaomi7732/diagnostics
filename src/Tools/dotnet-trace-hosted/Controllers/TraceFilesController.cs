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
    }
}