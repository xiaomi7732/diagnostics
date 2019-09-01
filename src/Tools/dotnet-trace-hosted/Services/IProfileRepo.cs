using System.Threading.Tasks;

namespace HostedTrace
{
    public interface IProfileRepo
    {
        bool Exists();
        Task SaveAsync(string content);
        Task<string> LoadAsync();
    }
}