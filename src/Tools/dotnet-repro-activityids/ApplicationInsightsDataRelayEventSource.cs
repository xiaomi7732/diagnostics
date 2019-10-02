//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
//-----------------------------------------------------------------------------

using System.Diagnostics.Tracing;

namespace ServiceProfiler.EventPipe.Client.EventListeners
{
    [EventSource(Name = EventSourceName,
        Guid = EventSourceGuidString)]
    public class ApplicationInsightsDataRelayEventSource : EventSource
    {
        public const string EventSourceName = "Microsoft-ApplicationInsights-DataRelay";
        public const string EventSourceGuidString = "8206c581-c6a3-550a-af53-6e0421740cbe";

        public static ApplicationInsightsDataRelayEventSource Log { get; } = new ApplicationInsightsDataRelayEventSource();

        public sealed class Keywords
        {
            public const EventKeywords Request = (EventKeywords)0x1;
            public const EventKeywords Operations = (EventKeywords)0x400;
        }

        public sealed class Tasks
        {
            public const EventTask Request = (EventTask)0x1;
        }

        public class EventIds
        {
            public const int RequestStart = 1;
            public const int RequestStop = 2;
        }

        [Event(EventIds.RequestStart, Keywords = Keywords.Request, Level = EventLevel.Verbose, Opcode = EventOpcode.Start, Task = Tasks.Request, ActivityOptions = EventActivityOptions.Disable)]
        public void RequestStart(
            string id,
            string name,
            long startTimeTicks,
            long endTimeTicks,
            string requestId,
            string operationName,
            string machineName,
            string operationId)
        {
            WriteEvent(EventIds.RequestStart,
            id,
            name,
            startTimeTicks,
            endTimeTicks,
            requestId,
            operationName,
            machineName,
            operationId);
        }

        [Event(EventIds.RequestStop, Keywords = Keywords.Request, Level = EventLevel.Verbose, Opcode = EventOpcode.Stop, Task = Tasks.Request, ActivityOptions = EventActivityOptions.Disable)]
        public void RequestStop(
            string id,
            string name,
            long startTimeTicks,
            long endTimeTicks,
            string requestId,
            string operationName,
            string machineName,
            string operationId)
        {
            WriteEvent(EventIds.RequestStop,
            id,
            name,
            startTimeTicks,
            endTimeTicks,
            requestId,
            operationName,
            machineName,
            operationId);
        }
    }
}
