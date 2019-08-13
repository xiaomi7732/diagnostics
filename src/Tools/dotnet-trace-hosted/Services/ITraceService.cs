using System.IO;

namespace HostedTrace
{

    public interface ITraceService
    {
        ulong Start(int processId, FileInfo output, uint buffersize, string profile, TraceFileFormat format);
        bool Stop(int processId, ulong? sessionId = null);
    }
}