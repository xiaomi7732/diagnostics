namespace HostedTrace
{
    public interface ICounterPayload
    {
        string GetName();
        double GetValue();
        string GetDisplay();
    }
}