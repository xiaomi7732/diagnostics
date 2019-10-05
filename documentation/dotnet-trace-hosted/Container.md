# Run .NET Core Application Performance Monitor in a container

## Description

This is an example to show how to run .NET Core Application Performance Monitor (.NET Core APM) in a container with your .NET Core 3.0 application.

## Walk-through

### Containerize your app and build an image

* Create a docker file like this: [Dockerfile](../../examples/container/dockerfile).

* Pull the images:

```bash
docker pull mcr.microsoft.com/dotnet/core/sdk:3.0
docker pull mcr.microsoft.com/dotnet/core/aspnet:3.0
```

* Build the container and tag it:

```bash
docker build . -t container-example:1.0
```

* Run the container and make sure it works:

```bash
docker run -d -p 8080:80 --name container-example container-example:1.0
```

Hit the endpoint to see it working (Try it in browser if you don't have curl installed.):

```bash
curl http://localhost:8080/weatherforecast
```

* Stop the container

```bash
docker container rm container-example -f
```

For more details, reference to the [official documentation](https://docs.docker.com/engine/examples/dotnetcore/).

### Get binaries of .NET Core APM

Download the binaries from the release page [v0.0.3](https://github.com/xiaomi7732/diagnostics/releases/tag/v0.0.3).
Extract the zip file to a local folder, `D:\DotNetTrace` for example.

### Run the container

```shell
docker run -v D:\DotNetTrace\:/dotnettrace -d -p 8080:80 -p 9400:9400 --name container-example container-example:1.0
```

Notice the parameter `-v` mounts a local volume into the container; And also, there's an additional port mapping for 9400.

### Start a APM process

Once the container is up and running, we need to start the dotnet diagnostics tools:

```bash
docker exec container-example /dotnettrace/dotnet-trace-hosted
```

Open the target url in a browser. For example: [http://localhost:9400/](http://localhost:9400/).

### Final thoughts

There are multiple ways to get the binaries into the container, mounting it from the local storage is an easy solution that won't impact the final image.

If you want the tool to be deployed into the production image, consider put the binaries into the solution and copy it to the images in the dockerfile.

There are also ways/challenges to start 2 processes within the same container. That makes the tool always running with the app.

Feel free to [feedback or file issues](https://github.com/xiaomi7732/diagnostics/issues).
