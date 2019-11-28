using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Diagnostics.Tracing;

namespace HostedTrace
{
    public sealed class MonitorTraceSession : TraceSessionId, IDisposable
    {
        // Worth of 1 minute of data when the interval is 1 second
        private const int MaxMetricsCount = 60;
        private EventPipeEventSource _eventSource;
        private readonly ConcurrentDictionary<string, Queue<double>> _metrics;
        private readonly CounterFilter _counterFilter;
        private readonly int _intervalInSeconds;
        private readonly IHubContext<CounterHub> _hubContext;

        public MonitorTraceSession(
            int processId, ulong sessionId,
            EventPipeEventSource eventPipeEventSource, CounterFilter filter, int intervalInSeconds,
            IHubContext<CounterHub> hubContext) :
            base(processId, sessionId)
        {
            this.Type = TraceSessionType.Monitor;
            _metrics = new ConcurrentDictionary<string, Queue<double>>();
            _eventSource = eventPipeEventSource ?? throw new System.ArgumentNullException(nameof(eventPipeEventSource));
            _counterFilter = filter ?? throw new ArgumentNullException(nameof(filter));
            _intervalInSeconds = intervalInSeconds;
            _hubContext = hubContext ?? throw new ArgumentNullException(nameof(hubContext));
            Task.Run(() =>
            {
                try
                {
                    _eventSource.Dynamic.All += Dynamic_All;
                    _eventSource.Process();
                }
                catch
                {
                    // Best effort.
                }
            });
        }

        public void Report(string metricName, double metricValue)
        {
            Debug.WriteLine("[{0}] {1}", metricName, metricValue);
            if (!_metrics.ContainsKey(metricName))
            {
                _metrics.TryAdd(metricName, new Queue<double>(MaxMetricsCount));
            }
            Queue<double> queue = _metrics[metricName];

            // Keep proper length for the queue.
            while (queue.Count >= MaxMetricsCount)
            {
                queue.Dequeue();
            }
            queue.Enqueue(metricValue);
            _hubContext.Clients.All.SendAsync("UpdateCounterAsync", ProcessId, Id, metricName, metricValue);
        }

        public Dictionary<string, List<double>> GetMetrics()
        {
            return new Dictionary<string, List<double>>(_metrics.ToArray().Select(kv => new KeyValuePair<string, List<double>>(kv.Key, kv.Value.ToList())));
        }

        public void Dispose()
        {
            if (_eventSource != null)
            {
                _eventSource.Dynamic.All -= Dynamic_All;
                _eventSource.Dispose();
                _eventSource = null;
            }
        }

        private void Dynamic_All(TraceEvent obj)
        {
            // If we are paused, ignore the event. 
            // There's a potential race here between the two tasks but not a huge deal if we miss by one event.
            // writer.ToggleStatus(pauseCmdSet);

            if (obj.EventName.Equals("EventCounters"))
            {
                IDictionary<string, object> payloadVal = (IDictionary<string, object>)(obj.PayloadValue(0));
                IDictionary<string, object> payloadFields = (IDictionary<string, object>)(payloadVal["Payload"]);

                // If it's not a counter we asked for, ignore it.
                if (!_counterFilter.Filter(obj.ProviderName, payloadFields["Name"].ToString())) return;

                // There really isn't a great way to tell whether an EventCounter payload is an instance of 
                // IncrementingCounterPayload or CounterPayload, so here we check the number of fields 
                // to distinguish the two.
                ICounterPayload payload;
                if (payloadFields.ContainsKey("CounterType"))
                {
                    payload = payloadFields["CounterType"].Equals("Sum") ? (ICounterPayload)new IncrementingCounterPayload(payloadFields, _intervalInSeconds) : (ICounterPayload)new CounterPayload(payloadFields);
                }
                else
                {
                    payload = payloadFields.Count == 6 ? (ICounterPayload)new IncrementingCounterPayload(payloadFields, _intervalInSeconds) : (ICounterPayload)new CounterPayload(payloadFields);
                }
                Report(payload.GetDisplay() ?? payload.GetName(), payload.GetValue());
            }
        }
    }
}