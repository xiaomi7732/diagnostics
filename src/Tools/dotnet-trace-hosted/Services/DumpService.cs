using System;
using System.Diagnostics;
using System.IO;
using System.Runtime.InteropServices;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Diagnostics.Tools.RuntimeClient;

namespace HostedTrace
{
    internal partial class DumpService : IDumpService
    {
        private readonly ITraceRepoService _repo;

        public DumpService(ITraceRepoService repo)
        {
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
                returnCode = await CollectAsync(processId, working, diag, type).ConfigureAwait(false);
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

        private async Task<int> CollectAsync(int processId, string output, bool diag, DumpTypeOption type)
        {
            if (processId == 0)
            {
                throw new ArgumentNullException(nameof(processId));
            }

            try
            {
                if (output == null)
                {
                    // Build timestamp based file path
                    string timestamp = $"{DateTime.Now:yyyyMMdd_HHmmss}";
                    output = Path.Combine(Directory.GetCurrentDirectory(), RuntimeInformation.IsOSPlatform(OSPlatform.Windows) ? $"dump_{timestamp}.dmp" : $"core_{timestamp}");
                }
                // Make sure the dump path is NOT relative. This path could be sent to the runtime 
                // process on Linux which may have a different current directory.
                output = Path.GetFullPath(output);

                // Display the type of dump and dump path
                string dumpTypeMessage = type == DumpTypeOption.Mini ? "minidump" : "minidump with heap";

                if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
                {
                    // Get the process
                    Process process = Process.GetProcessById(processId);

                    await Windows.CollectDumpAsync(process, output, type);
                }
                else if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux))
                {
                    DiagnosticsHelpers.DumpType dumpType = type == DumpTypeOption.Heap ? DiagnosticsHelpers.DumpType.WithHeap : DiagnosticsHelpers.DumpType.Normal;

                    // Send the command to the runtime to initiate the core dump
                    var hr = DiagnosticsHelpers.GenerateCoreDump(processId, output, dumpType, diag);
                    if (hr != 0)
                    {
                        throw new InvalidOperationException($"Core dump generation FAILED 0x{hr:X8}");
                    }
                }
                else
                {
                    throw new PlatformNotSupportedException($"Unsupported operating system: {RuntimeInformation.OSDescription}");
                }
            }
            catch (Exception ex) when
                (ex is FileNotFoundException ||
                 ex is DirectoryNotFoundException ||
                 ex is UnauthorizedAccessException ||
                 ex is PlatformNotSupportedException ||
                 ex is InvalidDataException ||
                 ex is InvalidOperationException ||
                 ex is NotSupportedException)
            {
                throw;
            }
            return 0;
        }
    }
}