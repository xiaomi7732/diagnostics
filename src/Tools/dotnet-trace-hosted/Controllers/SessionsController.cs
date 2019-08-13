using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;

namespace HostedTrace
{
    [ApiController]
    [Route("[controller]")]
    public class SessionsController : ControllerBase
    {
        private readonly ITraceSessionManager _sessionManager;
        public SessionsController(ITraceSessionManager sessionManager)
        {
            _sessionManager = sessionManager ?? throw new ArgumentNullException(nameof(sessionManager));
        }

        [HttpGet]
        public ActionResult<IEnumerable<TraceSession>> Get()
        {
            return Ok(_sessionManager.ListAll());
        }
    }
}