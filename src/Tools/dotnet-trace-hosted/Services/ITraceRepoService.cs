using System.Collections.Generic;
using System.IO;

namespace HostedTrace
{
    public interface ITraceRepoService
    {
        string GetRepoPath();
        string GetNewTraceFileFullPath(TraceFileFormat format = TraceFileFormat.NetTrace);
        void ConvertFormat(string fileName, TraceFileFormat outputFormat);
        IEnumerable<TraceFile> ListTraceFiles();
        Stream GetFileStream(string fileName);
    }
}