namespace APMExp.Models.Counters
{
    public interface ICounterPayload
    {
        string GetName();
        double GetValue();
        string GetDisplay();
    }
}