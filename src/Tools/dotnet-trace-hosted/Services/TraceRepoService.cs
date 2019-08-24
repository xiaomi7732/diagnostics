using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Microsoft.Diagnostics.Tools.RuntimeClient;

namespace HostedTrace
{
    public class TraceRepoService : ITraceRepoService
    {
        private readonly IDictionary<TraceFileFormat, string> _traceFileExtensions = new Dictionary<TraceFileFormat, string>(){
            {TraceFileFormat.NetTrace, "nettrace"},
            {TraceFileFormat.Speedscope, "speedscope.json"}
        };

        public void ConvertFormat(string fileName, TraceFileFormat outputFormat)
        {
            if (outputFormat == TraceFileFormat.NetTrace)
            {
                throw new ArgumentException("Cannot convert to nettrace format.");
            }

            string sourceFile = Path.Combine(GetRepoPath(), fileName);
            if (!File.Exists(sourceFile))
            {
                throw new FileNotFoundException("Source file is not found.", sourceFile);
            }
            string targetFile = Path.ChangeExtension(sourceFile, _traceFileExtensions[outputFormat]);
            if (File.Exists(targetFile))
            {
                throw new AccessViolationException("Target file exist.");
            }

            Microsoft.Diagnostics.Tools.RuntimeClient.
        }

        public Stream GetFileStream(string fileName)
        {
            string fullPath = Path.Combine(GetRepoPath(), fileName);
            if (File.Exists(fullPath))
            {
                Stream fileStream = new FileStream(fullPath, FileMode.Open);
                return fileStream;
            }
            else
            {
                throw new FileNotFoundException("File doesn't exists.", fullPath);
            }
        }

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
                result = result.Union(Directory.EnumerateFiles(searchBasePath, $"*." + ext.TrimStart('.')).Select(fullPath => new TraceFile()
                {
                    FileName = Path.GetFileName(fullPath),
                    FullPath = fullPath,
                }));
            }
            return result;
        }
    }
}