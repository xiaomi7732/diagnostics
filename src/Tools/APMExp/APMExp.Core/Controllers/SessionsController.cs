using System;
using System.Collections.Generic;
using APMExp.Models.TraceSessions;
using APMExp.Services;
using Microsoft.AspNetCore.Mvc;

namespace APMExp.Controllers
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
        public ActionResult<IEnumerable<TraceSessionId>> Get()
        {
            return Ok(_sessionManager.ListAll());
        }
    }
}