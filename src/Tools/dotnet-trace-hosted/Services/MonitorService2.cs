using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Threading.Tasks;
using Microsoft.Diagnostics.Tools.Counters;
using Microsoft.Diagnostics.Tools.RuntimeClient;
using Microsoft.Diagnostics.Tracing;

namespace HostedTrace
{
    public class MonitorService2 : IMonitorService
    {
        CounterConfiguration _configuration;
        CounterFilter _filter;

        EventPipeEventSource _eventSource;

        public MonitorService2(CounterConfiguration configuration)
        {
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        }

        public Task<ulong> StartMonitorAsync(int processId)
        {
            _filter = new CounterFilter();

            List<string> providerStringList = new List<string>();
            foreach (string providerName in _configuration.ProviderNames)
            {
                if (KnownData.TryGetProvider(providerName, out CounterProvider provider))
                {
                    string providerString = provider.ToProviderString(_configuration.IntervalInSeconds);
                    providerStringList.Add(providerString);
                    _filter.AddFilter(providerName);
                }
            }
            if (providerStringList.Count == 0)
            {
                throw new InvalidOperationException("No proper provider.");
            }
            string providerStrings = string.Join(',', providerStringList);

            Debug.WriteLine("Provider strings: {0}", providerStrings);

            _eventSource = RequestTracing(providerStrings, processId, out ulong sessionId);
            if (sessionId > 0)
            {
                Task.Run(() =>
                {
                    _eventSource.Dynamic.All += Dynamic_All;
                    _eventSource.Process();
                });
                return Task.FromResult(sessionId);
            }
            else
            {
                throw new InvalidOperationException("Can't start a monitor session");
            }
        }

        public Task StopMonitorAsync(string processId, int sessionId)
        {
            throw new System.NotImplementedException();

        }

        private EventPipeEventSource RequestTracing(string providerStrings, int processId, out ulong sessionId)
        {
            EventPipeEventSource source = null;
            try
            {
                var configuration = new SessionConfigurationV2(
                                circularBufferSizeMB: 1000,
                                format: EventPipeSerializationFormat.NetTrace,
                                requestRundown: false,
                                providers: Microsoft.Diagnostics.Tools.Trace.Extensions.ToProviders(providerStrings));
                var binaryReader = EventPipeClient.CollectTracing2(processId, configuration, out sessionId);
                source = new EventPipeEventSource(binaryReader);

            }
            catch (EventPipeUnknownCommandException)
            {
                var configuration = new SessionConfiguration(
                                        circularBufferSizeMB: 1000,
                                        format: EventPipeSerializationFormat.NetTrace,
                                        providers: Microsoft.Diagnostics.Tools.Trace.Extensions.ToProviders(providerStrings));
                var binaryReader = EventPipeClient.CollectTracing(processId, configuration, out sessionId);
                source = new EventPipeEventSource(binaryReader);
            }
            return source;
        }

        public event EventHandler<(string, ICounterPayload)> Update;

        private void OnUpdate(string providerName, ICounterPayload payload)
        {
            Debug.WriteLine("[{0}] {1} {2}", providerName, payload.GetDisplay(), payload.GetValue());
            Update?.Invoke(this, (providerName, payload));
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
                if (!_filter.Filter(obj.ProviderName, payloadFields["Name"].ToString())) return;

                // There really isn't a great way to tell whether an EventCounter payload is an instance of 
                // IncrementingCounterPayload or CounterPayload, so here we check the number of fields 
                // to distinguish the two.
                ICounterPayload payload;
                if (payloadFields.ContainsKey("CounterType"))
                {
                    payload = payloadFields["CounterType"].Equals("Sum") ? (ICounterPayload)new IncrementingCounterPayload(payloadFields, _configuration.IntervalInSeconds) : (ICounterPayload)new CounterPayload(payloadFields);
                }
                else
                {
                    payload = payloadFields.Count == 6 ? (ICounterPayload)new IncrementingCounterPayload(payloadFields, _configuration.IntervalInSeconds) : (ICounterPayload)new CounterPayload(payloadFields);
                }


                // writer.Update(obj.ProviderName, payload, pauseCmdSet);
                OnUpdate(obj.ProviderName, payload);
            }
        }
    }
}