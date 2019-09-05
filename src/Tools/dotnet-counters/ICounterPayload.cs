namespace Microsoft.Diagnostics.Tools.Counters
{
    public interface ICounterPayload
    {
        string GetName();
        double GetValue();
        string GetDisplay();
    }
}