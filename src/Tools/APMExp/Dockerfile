# Notice, `src` is assumed to be the docker building context for this docker file.
# Refer to `BuildDockerImage.cmd` for details.
FROM mcr.microsoft.com/dotnet/core/sdk:3.0 AS build-env
WORKDIR /app

COPY Microsoft.Diagnostics.Tools.RuntimeClient ./Microsoft.Diagnostics.Tools.RuntimeClient
COPY Tools/APMExp ./
RUN dotnet publish APMExp.Backend/APMExp.Backend.csproj -c Release -o out

# Build runtime image
FROM mcr.microsoft.com/dotnet/core/aspnet:3.0
WORKDIR /app
COPY --from=build-env /app/out .
ENTRYPOINT ["dotnet", "apmexp.dll"]