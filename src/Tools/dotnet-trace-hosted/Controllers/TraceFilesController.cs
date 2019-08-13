using System;
using System.Collections.Generic;
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
                return Ok(_traceRepoService.ListTraceFiles());
            }
            catch (Exception ex)
            {
                return Conflict(ex.ToString());
            }
        }
    }
}