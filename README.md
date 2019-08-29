# .NET Core Diagnostics - Fancy Trace

This is a fork of the [.NET Core Diagnostics Repo](https://github.com/dotnet/diagnostics) intending to provide a better experiences/solutions for dotnet-trace tool of .NET Core 3.0.

## Motivation

> [**Rules of Optimization**](http://wiki.c2.com/?RulesOfOptimization)  
First rule of optimization - Dont't  
Second rule of optimization - Don't...yet.  
Profile before optimizing  
-- [Michael Jackson](http://wiki.c2.com/?MichaelJackson)

If I would run to rule 3, I probably wanted the performance profiling to happen easily.

.NET Core 3.0 provides CLI tools to do the profiling.

* Although the command line is a cross platform solution, it is not as easy as button clicks.
* Once the trace is gathered, it is not easy to get the trace when it is inside a container or hosted remotely.

This repo does an experiment to put a web UI on top of the command lines to make it easier to use for various scenarios: premises box, locally hosted container, Azure container. Also, the web UI will stream the trace file gathered by dotnet-trace allows offline analysis.

## Quick Start

* [Dotnet Trace (Profiling) Basic Usage (Windows)](./documentation/dotnet-trace-hosted/GetStarted.md)
* // More to come.

## Road map

1. Provide a story for on premises profiling.
1. Run it in local hosted containers, provides a way to easily fetch the trace files.
1. Extend it to run in Azure.

## Develop status

The implementation is provided at [src/Tools/dotnet-trace-hosted](./src/Tools/dotnet-trace-hosted) and [src/Tools/dotnet-trace-hosted-webui](./src/Tools/dotnet-trace-hosted-webui). Here's how the UI looks like today:

![dotnet-trace WebUI](./media/DotnetTraceWebUI.png)

## Architecture

// TODO: Add more details here.

## Disclosure

I currently work for Microsoft. However, this project is a pure hobby and is not funded by Microsoft.
