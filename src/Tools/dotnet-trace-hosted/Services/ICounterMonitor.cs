using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Diagnostics.Tools.Counters;

namespace HostedTrace
{
    public interface ICounterMonitor
    {
        event EventHandler<(string, ICounterPayload)> Update;
        Task<ulong> StartMonitorAsync(List<string> counterList, int processId, int intervalInSeconds);
        Task<bool> StopMonitorAsync(int processId, ulong sessionId);
    }
}