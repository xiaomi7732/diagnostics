namespace APMExp.Services
{
    public enum DumpTypeOption
    {
        Heap,       // A large and relatively comprehensive dump containing module lists, thread lists, all 
                    // stacks, exception information, handle information, and all memory except for mapped images.
        Mini        // A small dump containing module lists, thread lists, exception information and all stacks.
    }
}