using System.IO;
using System.Threading.Tasks;
using APMExp.Models;

namespace APMExp.Services
{

    public interface ITraceService
    {
        Task<ulong> StartAsync(int processId, FileInfo output, uint buffersize, string profile, TraceFileFormat format);
        bool Stop(int processId, ulong? sessionId = null);
    }
}