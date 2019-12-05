using System.Collections.Generic;
using System.IO;
using APMExp.Models;

namespace APMExp.Services
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