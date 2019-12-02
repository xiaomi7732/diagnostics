using System;
using System.Collections.Generic;

namespace HostedTrace
{
    class IncrementingCounterPayload : ICounterPayload
    {
        public string m_Name;
        public double m_Value;
        public string m_DisplayName;
        public string m_DisplayRateTimeScale;
        public IncrementingCounterPayload(IDictionary<string, object> payloadFields, int interval)
        {
            m_Name = payloadFields["Name"].ToString();
            m_Value = (double)payloadFields["Increment"];
            m_DisplayName = payloadFields["DisplayName"].ToString();
            m_DisplayRateTimeScale = payloadFields["DisplayRateTimeScale"].ToString();

            // In case these properties are not provided, set them to appropriate values.
            m_DisplayName = m_DisplayName.Length == 0 ? m_Name : m_DisplayName;
            m_DisplayRateTimeScale = m_DisplayRateTimeScale.Length == 0 ? $"{interval} sec" : TimeSpan.Parse(m_DisplayRateTimeScale).ToString("%s' sec'");
        }

        public string GetName()
        {
            return m_Name;
        }

        public double GetValue()
        {
            return m_Value;
        }

        public string GetDisplay()
        {
            return $"{m_DisplayName} / {m_DisplayRateTimeScale}";
        }
    }
}