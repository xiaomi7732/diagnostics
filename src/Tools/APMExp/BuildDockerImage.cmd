@ECHO OFF

SETLOCAL
IF "%1" == "" GOTO HELP
SET TAG=%1
SET SCRIPT_PATH=%~dp0
SET DockerFile=%SCRIPT_PATH%Dockerfile

REM Go to script path
PUSHD %SCRIPT_PATH%
COPY dockerignore.txt ..\..\.dockerignore

REM Go to src
CD ../..
REM Call the build
docker build -t saars/apmexp-demo:%TAG% -f %DockerFile% .
DEL .dockerignore
POPD

GOTO EXIT

:HELP
ECHO Example: BuildDockerImage 0.0.2
GOTO EXIT

:EXIT
ENDLOCAL
