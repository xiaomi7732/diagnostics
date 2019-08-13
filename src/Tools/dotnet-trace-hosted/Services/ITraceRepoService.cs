using System.Collections.Generic;
using System.IO;

namespace HostedTrace
{
    public interface ITraceRepoService
    {
        string GetRepoPath();
        string GetNewTraceFileFullPath(TraceFileFormat format = TraceFileFormat.NetTrace);
        IEnumerable<TraceFile> ListTraceFiles();
        Stream GetFileStream(string fileName);
    }
}