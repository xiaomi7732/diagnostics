using System.Collections.Generic;

namespace HostedTrace
{
    public interface ITraceRepoService
    {
        string GetRepoPath();
        string GetNewTraceFileFullPath(TraceFileFormat format = TraceFileFormat.NetTrace);
        IEnumerable<TraceFile> ListTraceFiles();
    }
}