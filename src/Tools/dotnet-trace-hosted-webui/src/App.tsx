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
import { AppHeader } from './Components/AppHeader';
import { ConnectionStatus } from './Components/ConnectionStatus';
import { Profile } from './Models/Profile';
import ProfilePicker from './Components/ProfilePicker';

interface AppState {
  processArray: Process[] | undefined;
  traceSessionArray: TraceSession[] | undefined;
  traceFileArray: TraceFile[] | undefined;
  isReady: boolean;
  isBackendReady: boolean;
  backendUrlArray: string[];
  baseUrl: string;
  profileArray: Profile[] | undefined;
  selectedProfile: string | undefined;
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
      profileArray: undefined,
      selectedProfile: undefined,
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
          <ConnectionStatus baseUrl={this.state.baseUrl}
            disconnectBackend={this.disconnectBackend}
          />
          <ProfilePicker
            profileArray={this.state.profileArray}
            onSelected={this.selectProfile}
            selectedProfile={this.state.selectedProfile}
            onRefresh={this.LoadProfilesAsync}
          />
          <Processes
            refreshProcessAsync={this.loadProcessesAsync}
            startProfilingAsync={this.startProfilingAsync}
            takeDumpAsync={this.takeDumpAsync}
            processArray={this.state.processArray}
          />
          <TraceSessions
            traceSessions={this.state.traceSessionArray}
            stopProfilingAsync={this.stopProfilingAsync}
            loadTraceSessionsAsync={this.loadTraceSessionsAsync} />
          <TraceRepo
            baseUrl={this.state.baseUrl}
            loadTraceFilesAsync={this.loadTraceFilesAsync}
            convertToSpeedscopeAsync={this.convertToSpeedscopeAsync}
            fileArray={this.state.traceFileArray}
          />
        </div>
      ) : null;
    }

    return (
      <div className='dark-theme'>
        <AppHeader />
        <div className='app-container'>
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
      this.LoadProfilesAsync(),
    ]);

    this.selectProfile('runtime-basic');

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
        processId: processId,
        profile: this.state.selectedProfile,
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

  private convertToSpeedscopeAsync: (fileName: string) => Promise<boolean> = async (fileName) => {
    const response = await fetch(`${this.state.baseUrl}/traceFiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName,
      }),
    });
    if (!!response && response.ok) {
      await this.loadTraceFilesAsync();
      return true;
    } else {
      const error = await response.json();

      alert('Converting failed.' + !!error.error ? ' Details: ' + error.error : '');
    }
    return false;
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

  // Profiles
  private LoadProfilesAsync: () => void = async () => {
    const result = await this.getProfilesAsync();
    if (result.length > 0) {
      this.setState({
        profileArray: result,
      });
    } else {
      this.setState({
        profileArray: undefined,
      });
    }
  }

  private getProfilesAsync: () => Promise<Profile[]> = async () => {
    const response = await fetch(`${this.state.baseUrl}/profiles`);
    if (!!response && response.ok) {
      const result: Profile[] = await response.json();
      return result;
    }
    return [];
  }

  private selectProfile: (newValue: string) => void = (newValue: string) => {
    this.setState({
      selectedProfile: newValue
    });
  }

  // Dumps
  private takeDumpAsync: (processId: number, isMini: boolean) => Promise<any> = async (processId, isMini) => {
    const DUMP_TYPE_HEAP = 0;
    const DUMP_TYPE_MINI = 1;
    const dumpType = isMini ? DUMP_TYPE_MINI : DUMP_TYPE_HEAP;
    const response = await fetch(`${this.state.baseUrl}/dumps`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        processId,
        dumpType,
      }),
    });
    if (!!response && response.ok) {
      await this.loadTraceFilesAsync();
      alert('Dump crated for process ' + processId);
      return true;
    } else {
      alert('Failed to create the dump for this process: ' + processId);
    }
    return false;
  }
}