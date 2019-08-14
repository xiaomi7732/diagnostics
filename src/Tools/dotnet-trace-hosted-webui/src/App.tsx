import React, { Component } from 'react';
import './App.css';
import './Components/Processes'
import Process from './Models/Process';
import { TraceSession } from './Models/TraceSession';

import Processes from './Components/Processes';
import TraceSessions from './Components/TraceSessions';
import TraceFile from './Models/TraceFile';
import TraceRepo from './Components/TraceRepo';

interface AppState {
  processArray: Process[] | undefined;
  traceSessionArray: TraceSession[] | undefined;
  traceFileArray: TraceFile[] | undefined;
  isReady: boolean;
}

export default class App extends Component<any, AppState>{
  constructor(props: any) {
    super(props);

    // Initial state
    this.state = {
      processArray: undefined,
      traceSessionArray: undefined,
      traceFileArray: undefined,
      isReady: false,
    };

    this.initializeAsync();
  }
  render() {
    return this.state.isReady ? (
      <div>
        <h1>.NET Core Profiling Console</h1>
        <Processes
          refreshProcessAsync={this.loadProcessesAsync}
          startProfilingAsync={this.startProfilingAsync}
          processArray={this.state.processArray}
        />
        <TraceSessions
          traceSessions={this.state.traceSessionArray}
          stopProfilingAsync={this.stopProfilingAsync}
          loadTraceSessionsAsync={this.loadTraceSessionsAsync} />
        <TraceRepo
          fileArray={this.state.traceFileArray}
        />
      </div>
    ) : null;
  }

  private initializeAsync: () => Promise<any> = async () => {
    await Promise.all([
      this.loadProcessesAsync(),
      this.loadTraceSessionsAsync(),
      this.loadTraceFilesAsync(),
    ]);

    this.setState({
      isReady: true,
    });
  }

  // Processes
  private loadProcessesAsync: () => Promise<void> = async () => {
    try {
      const processes = await this.getProcessesAsync();
      this.setState({
        processArray: processes,
      });
    } catch (ex) {
      this.setState({
        processArray: undefined,
      });
    }
  }
  private getProcessesAsync: () => Promise<Process[]> = async () => {
    const response = await fetch('https://localhost:5001/processes');
    if (!!response && response.ok) {
      const results: Process[] = await response.json();
      return results;
    }
    return [];
  }

  // Traces
  private startProfilingAsync: (processId: number) => Promise<boolean> = async (processId: number) => {
    const response = await fetch('https://localhost:5001/traces', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        processId: processId
      }),
    });

    const result = !!response && response.ok;
    if (result) {
      await this.loadTraceSessionsAsync();
    }
    return result;
  }

  private stopProfilingAsync: (processId: number, sessionId: number) => Promise<boolean> = async (processId: number, sessionId: number) => {
    const response = await fetch(`https://localhost:5001/traces/${processId}?sid=${sessionId}`, {
      method: 'DELETE',
    });

    const result = !!response && response.ok;
    if (result) {
      await this.loadTraceSessionsAsync();
    }
    return result;
  }

  // Sessions
  private loadTraceSessionsAsync: () => Promise<void> = async () => {
    try {
      const traceSessions = await this.getTraceSessionsAsync();
      this.setState({
        traceSessionArray: traceSessions,
      });
    } catch{
      this.setState({
        traceSessionArray: undefined,
      });
    }
  }

  private getTraceSessionsAsync: () => Promise<TraceSession[]> = async () => {
    const response = await fetch('https://localhost:5001/sessions');
    if (!!response && response.ok) {
      const result: TraceSession[] = await response.json();
      return result;
    }
    return [];
  }

  // Repository
  private loadTraceFilesAsync: () => Promise<void> = async () => {
    try {
      const files = await this.getTraceFilesAsync();
      this.setState({
        traceFileArray: files,
      });
    } catch{
      this.setState({
        traceFileArray: undefined,
      });
    }
  }

  private getTraceFilesAsync: () => Promise<TraceFile[]> = async () => {
    const response = await fetch('https://localhost:5001/traceFiles');
    if (!!response && response.ok) {
      const result: TraceFile[] = await response.json();
      return result;
    }
    return [];
  }
}

