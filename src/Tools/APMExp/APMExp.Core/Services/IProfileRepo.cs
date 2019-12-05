using System.Threading.Tasks;

namespace APMExp.Services
{
    public interface IProfileRepo
    {
        bool Exists();
        Task SaveAsync(string content);
        Task<string> LoadAsync();
    }
}