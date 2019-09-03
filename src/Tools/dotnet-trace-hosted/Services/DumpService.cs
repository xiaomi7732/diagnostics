using System;
using System.IO;
using System.Runtime.InteropServices;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Diagnostics.Tools.Dump;
using static Microsoft.Diagnostics.Tools.Dump.Dumper;

namespace HostedTrace
{
    internal class DumpService : IDumpService
    {
        private readonly Dumper _dumper;
        private readonly ITraceRepoService _repo;

        public DumpService(Dumper dumper, ITraceRepoService repo)
        {
            this._dumper = dumper ?? throw new ArgumentNullException(nameof(dumper));
            this._repo = repo ?? throw new ArgumentNullException(nameof(repo));
        }

        public async Task<bool> CollectAsync(int processId, bool diag, DumpTypeOption type, CancellationToken cancellationToken)
        {
            string basePath = _repo.GetRepoPath();

            string osMoniker = RuntimeInformation.IsOSPlatform(OSPlatform.Windows) ? "win" : "linux";
            string output = Path.Combine(basePath, $"{processId}_{DateTime.UtcNow.ToString("yyyyMMddHHmmss")}_{osMoniker}");
            output = Path.ChangeExtension(output, ".dmp");
            string working = Path.ChangeExtension(output, ".tdmp");

            int returnCode = int.MinValue;
            try
            {
                returnCode = await _dumper.Collect(null, processId, working, diag, type).ConfigureAwait(false);
                if (returnCode == 0)
                {
                    File.Move(working, output);
                    return true;
                }
                return false;
            }
            catch
            {
                return false;
            }
            finally
            {
                // Best effort
                try
                {
                    File.Delete(working);
                }
                catch { }
            }
        }
    }
}