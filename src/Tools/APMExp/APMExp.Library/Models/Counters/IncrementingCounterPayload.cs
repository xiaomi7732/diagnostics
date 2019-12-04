using System;
using System.Collections.Generic;

namespace APMExp.Models.Counters
{
    class IncrementingCounterPayload : ICounterPayload
    {
        private int timescaleInSec;

        public string m_Name;
        public double m_Value;
        public string m_DisplayName;
        public string m_DisplayRateTimeScale;
        public string m_DisplayUnits;

        public IncrementingCounterPayload(IDictionary<string, object> payloadFields, int interval)
        {
            m_Name = payloadFields["Name"].ToString();
            m_Value = (double)payloadFields["Increment"];
            m_DisplayName = payloadFields["DisplayName"].ToString();
            m_DisplayRateTimeScale = payloadFields["DisplayRateTimeScale"].ToString();
            m_DisplayUnits = payloadFields["DisplayUnits"].ToString();
            timescaleInSec = m_DisplayRateTimeScale.Length == 0 ? 1 : (int)TimeSpan.Parse(m_DisplayRateTimeScale).TotalSeconds;
            m_Value *= timescaleInSec;

            // In case these properties are not provided, set them to appropriate values.
            m_DisplayName = m_DisplayName.Length == 0 ? m_Name : m_DisplayName;
            m_DisplayRateTimeScale = m_DisplayRateTimeScale.Length == 0 ? $"{interval} sec" : $"{timescaleInSec} sec";
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
            if (m_DisplayUnits.Length > 0)
            {
                return $"{m_DisplayName} / {m_DisplayRateTimeScale} ({m_DisplayUnits})";
            }

            return $"{m_DisplayName} / {m_DisplayRateTimeScale}";
        }
    }
}