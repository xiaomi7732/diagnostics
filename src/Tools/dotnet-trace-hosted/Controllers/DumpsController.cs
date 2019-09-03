using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using static Microsoft.Diagnostics.Tools.Dump.Dumper;

namespace HostedTrace
{
    [ApiController]
    [Route("[controller]")]
    public class DumpsController : ControllerBase
    {
        private readonly IDumpService _dumpService;

        public DumpsController(IDumpService dumpService)
        {
            _dumpService = dumpService ?? throw new System.ArgumentNullException(nameof(dumpService));
        }

        [HttpPost]
        public async Task<ActionResult> Dump([FromBody]DumpRequest requestParams)
        {
            bool succeeded = await _dumpService.CollectAsync(requestParams.ProcessId,
             requestParams.IsDiagnostics,
             requestParams.DumpType == DumpType.Heap ? DumpTypeOption.Heap : DumpTypeOption.Mini,
             CancellationToken.None).ConfigureAwait(false);

            if (succeeded)
            {
                return Ok();
            }
            else
            {
                return Conflict(requestParams);
            }
        }
    }
}