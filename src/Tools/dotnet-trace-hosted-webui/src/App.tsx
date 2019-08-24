import React, { Component } from 'react';
import './App.css';
import './Components/Processes'
import Process from './Models/Process';
import { TraceSession } from './Models/TraceSession';

import Processes from './Components/Processes';
import TraceSessions from './Components/TraceSessions';
import TraceFile from './Models/TraceFile';
import TraceRepo from './Components/TraceRepo';
import ConnectingToBackend from './Components/ConnectingToBackend';

interface AppState {
  processArray: Process[] | undefined;
  traceSessionArray: TraceSession[] | undefined;
  traceFileArray: TraceFile[] | undefined;
  isReady: boolean;
  isBackendReady: boolean;
  backendUrlArray: string[];
  baseUrl: string;
}

export default class App extends Component<any, AppState>{
  readonly BackendListKey: string = 'backendList';
  constructor(props: any) {
    super(props);

    // Initial state
    this.state = {
      processArray: undefined,
      traceSessionArray: undefined,
      traceFileArray: undefined,
      isReady: false,
      isBackendReady: false,
      backendUrlArray: this.getList(),
      baseUrl: '',
    };
  }
  render() {
    let content;

    if (!this.state.isBackendReady) {
      content = <ConnectingToBackend
        backendUrlArray={this.state.backendUrlArray}
        addBackend={this.addBackend}
        removeBackend={this.removeBackend}
        connectToBackendAsync={this.connectToBackendAsync}
      />;
    } else {
      content = this.state.isReady ? (
        <div>
          <h1>.NET Core Profiling Console</h1>
          <div>
            <span>You are connecting to: {this.state.baseUrl}</span>
            <input className='button' type='button' onClick={this.disconnectBackend} value='Disconnect'></input>
          </div>
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
            baseUrl={this.state.baseUrl}
            loadTraceFilesAsync={this.loadTraceFilesAsync}
            fileArray={this.state.traceFileArray}
          />
        </div>
      ) : null;
    }

    return (
      <div className='app-container'>
        <div className='dark-theme'>
          {content}
        </div>
      </div>
    );
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
    const response = await fetch(`${this.state.baseUrl}/processes`);
    if (!!response && response.ok) {
      const results: Process[] = await response.json();
      return results;
    }
    return [];
  }

  // Traces
  private startProfilingAsync: (processId: number) => Promise<boolean> = async (processId: number) => {
    const response = await fetch(`${this.state.baseUrl}/traces`, {
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
    const response = await fetch(`${this.state.baseUrl}/traces/${processId}?sessionId=${sessionId}`, {
      method: 'DELETE',
    });

    const result = !!response && response.ok;
    if (result) {
      await Promise.all([this.loadTraceSessionsAsync(), this.loadTraceFilesAsync()]);
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
    const response = await fetch(`${this.state.baseUrl}/sessions`);
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
    const response = await fetch(`${this.state.baseUrl}/traceFiles`);
    if (!!response && response.ok) {
      const result: TraceFile[] = await response.json();
      return result;
    }
    return [];
  }

  // Backend
  private addBackend: (url: string) => void = (url: string) => {
    url = url.toLowerCase();
    const list = this.getList();
    if (!list.includes(url)) {
      list.push(url);
    }
    localStorage.setItem(this.BackendListKey, JSON.stringify(list));
    this.setState({
      backendUrlArray: list
    });
  }

  private removeBackend: (url: string) => void = (url: string): void => {
    url = url.toLowerCase();
    let list = this.getList();
    list = list.filter(item => item !== url);
    localStorage.setItem(this.BackendListKey, JSON.stringify(list));
    this.setState({
      backendUrlArray: list
    });
  }

  private getList(): string[] {
    const urlListSerialized: string | null = localStorage.getItem(this.BackendListKey);
    let list: string[];
    if (urlListSerialized === null || urlListSerialized === '' || urlListSerialized === '[]') {
      list = ['http://localhost:9400'];
    } else {
      list = JSON.parse(urlListSerialized);
    }
    return list;
  }

  private disconnectBackend: () => void = () => {
    this.setState({
      baseUrl: '',
      isReady: false,
      isBackendReady: false,
    });
  }

  private connectToBackendAsync: (url: string) => Promise<boolean> = async (url: string) => {
    try {
      url = url.trim();
      if (!url.startsWith('http') && !url.startsWith('https')) {
        return false;
      }
      if (url.endsWith('/')) {
        url = url.substring(0, url.length - 1);
      }
      const response = await fetch(url + '/processes');
      if (!!response && response.ok) {
        this.setState({
          isBackendReady: true,
          baseUrl: url,
        });
        await this.initializeAsync();
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  }
}

