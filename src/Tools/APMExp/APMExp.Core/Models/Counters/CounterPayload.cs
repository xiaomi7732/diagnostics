using System.Collections.Generic;

namespace APMExp.Models.Counters
{
    class CounterPayload : ICounterPayload
    {
        public string m_Name;
        public double m_Value;
        public string m_DisplayName;
        public string m_DisplayUnits;

        public CounterPayload(IDictionary<string, object> payloadFields)
        {
            m_Name = payloadFields["Name"].ToString();
            m_Value = (double)payloadFields["Mean"];
            m_DisplayName = payloadFields["DisplayName"].ToString();
            m_DisplayUnits = payloadFields["DisplayUnits"].ToString();

            // In case these properties are not provided, set them to appropriate values.
            m_DisplayName = m_DisplayName.Length == 0 ? m_Name : m_DisplayName;
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
                return $"{m_DisplayName} ({m_DisplayUnits})";
            }
            return $"{m_DisplayName}";
        }
    }
}