@if not defined _echo echo off
cls

dotnet.exe publish "%~dp0dotnet-trace-hosted.csproj" -c Release --self-contained -r win-x64 || (
    echo [ERROR] Failed to build %%c.
    exit /b 1
)

dotnet.exe publish "%~dp0dotnet-trace-hosted.csproj" -c Release --self-contained -r linux-x64 || (
    echo [ERROR] Failed to build %%c.
    exit /b 1
)
