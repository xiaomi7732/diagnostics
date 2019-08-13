using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace HostedTrace
{
    public class TraceRepoService : ITraceRepoService
    {
        private readonly IDictionary<TraceFileFormat, string> _traceFileExtensions = new Dictionary<TraceFileFormat, string>(){
            {TraceFileFormat.NetTrace, "nettrace"},
            {TraceFileFormat.Speedscope, "speedscope.json"}
        };

        public string GetNewTraceFileFullPath(TraceFileFormat format = TraceFileFormat.NetTrace)
        {
            return Path.ChangeExtension(Path.Combine(GetRepoPath(), DateTime.UtcNow.ToString("yyyyMMddHHmmss")), _traceFileExtensions[format]);
        }

        public string GetRepoPath()
        {
            return Path.GetTempPath();
        }

        public IEnumerable<TraceFile> ListTraceFiles()
        {
            string searchBasePath = GetRepoPath();
            int len = searchBasePath.Length;
            IEnumerable<TraceFile> result = Enumerable.Empty<TraceFile>();
            foreach (string ext in _traceFileExtensions.Values)
            {
                result = result.Union(Directory.EnumerateFiles(searchBasePath, $"*." + ext.TrimStart('.')).Select(fullPath => new TraceFile() { FileName = fullPath.Substring(len) }));
            }
            return result;
        }
    }
}