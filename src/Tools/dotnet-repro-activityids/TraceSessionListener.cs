//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
//-----------------------------------------------------------------------------

using System;
using System.Collections.Concurrent;
using System.Diagnostics.Tracing;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace ServiceProfiler.EventPipe.Client.EventListeners
{
    static class EventName
    {
        public const string Request = "Request";
        public const string Operation = "Operation";
    }

    internal class TraceSessionListener : EventListener
    {
        public const string MicrosoftApplicationInsightsDataEventSourceName = "Microsoft-ApplicationInsights-Data";

        public TraceSessionListener(ILogger<TraceSessionListener> logger)
        {
            _logger = logger;
            _ctorWaitHandle.Set();
        }

        protected override void OnEventSourceCreated(EventSource eventSource)
        {
            base.OnEventSourceCreated(eventSource);
            Task.Run(() =>
            {
                _ctorWaitHandle.Wait();
                if (string.Equals(eventSource.Name, MicrosoftApplicationInsightsDataEventSourceName, StringComparison.OrdinalIgnoreCase))
                {
                    _logger.LogDebug("[{0:O}] Enabling EventSource: {1}", DateTime.Now, eventSource.Name);
                    EnableEvents(eventSource, EventLevel.Verbose, (EventKeywords)0x1);
                }
            }).ConfigureAwait(false);
        }

        protected override void OnEventWritten(EventWrittenEventArgs eventData)
        {
            if (string.Equals(eventData.EventSource.Name,
                MicrosoftApplicationInsightsDataEventSourceName,
                StringComparison.Ordinal))
            {
                OnRichPayloadEventWritten(eventData);
            }
        }

        /// <summary>
        /// Parses the rich playload EventSource event, adapter it and pump it into the Relay EventSource.
        /// </summary>
        /// <param name="eventData"></param>
        public void OnRichPayloadEventWritten(EventWrittenEventArgs eventData)
        {
            _logger.LogTrace("{0} - EventName: {1}, Keywords: {2}, OpCode: {3}",
                nameof(OnRichPayloadEventWritten),
                eventData.EventName,
                eventData.Keywords,
                eventData.Opcode);
            if (eventData.EventName.Equals(EventName.Request, StringComparison.InvariantCulture) && (eventData.Keywords.HasFlag(ApplicationInsightsDataRelayEventSource.Keywords.Operations)))
            {
                // Operation is sent, handle Start and Stop for it.
                if (eventData.Opcode == EventOpcode.Start)
                {
                    DateTimeOffset startTimeUTC = DateTimeOffset.UtcNow;
                    long startTimeUTCTicks = startTimeUTC.UtcTicks;
                    ApplicationInsightsDataRelayEventSource.Log.RequestStart(
                        eventData.EventId.ToString(),
                        eventData.EventName,
                        startTimeUTCTicks,
                        // For start activity, endTime == startTime.
                        startTimeUTCTicks,
                        requestId: eventData.EventName,
                        operationName: eventData.EventName,
                        machineName: Environment.MachineName,
                        operationId: eventData.Opcode.ToString());
                    File.AppendAllLines("Debug.txt", new string[] { "Start" + ApplicationInsightsDataRelayEventSource.CurrentThreadActivityId });
                }
                else if (eventData.Opcode == EventOpcode.Stop)
                {
                    // Relay the event upon stop activity
                    long startTimeUTCTicks = DateTime.UtcNow.Ticks - 100;
                    DateTimeOffset endTimeUTC = DateTime.UtcNow;
                    long endTimeUTCTicks = endTimeUTC.UtcTicks;

                    ApplicationInsightsDataRelayEventSource.Log.RequestStop(
                        eventData.EventId.ToString(),
                        eventData.EventName,
                        startTimeUTCTicks,
                        endTimeUTCTicks,
                        requestId: eventData.EventName,
                        operationName: eventData.EventName,
                        machineName: Environment.MachineName,
                        operationId: eventData.Opcode.ToString());
                    System.Console.WriteLine(ApplicationInsightsDataRelayEventSource.CurrentThreadActivityId);
                    File.AppendAllLines("Debug.txt", new string[] { "Stop" + ApplicationInsightsDataRelayEventSource.CurrentThreadActivityId });

                }
            }
        }

        #region Dispose pattern
        private readonly ILogger _logger;
        private ManualResetEventSlim _ctorWaitHandle = new ManualResetEventSlim(false);
        private ConcurrentDictionary<string, DateTimeOffset> _startActivityTimestamps = new ConcurrentDictionary<string, DateTimeOffset>();

        private bool _isDisposed = false;
        public override void Dispose()
        {
            base.Dispose();
            // Dispose of unmanaged resources.
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool isDisposing)
        {
            if (_isDisposed) return;

            if (isDisposing)
            {
                if (_ctorWaitHandle != null)
                {
                    _ctorWaitHandle.Dispose();
                    _ctorWaitHandle = null;
                }
            }
            _isDisposed = true;
        }
        #endregion
    }
}
