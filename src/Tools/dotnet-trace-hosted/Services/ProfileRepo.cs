using System.IO;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace HostedTrace
{
    internal class ProfileRepo : IProfileRepo
    {
        private static readonly string RepoPath =
            Path.Combine(Path.GetDirectoryName(Assembly.GetEntryAssembly().Location), "Profiles.json");

        public bool Exists()
        {
            return File.Exists(RepoPath);
        }

        public Task<string> LoadAsync()
        {
            return File.ReadAllTextAsync(RepoPath);
        }

        public Task SaveAsync(string content)
        {
            return File.WriteAllTextAsync(RepoPath, content, Encoding.UTF8);
        }
    }
}