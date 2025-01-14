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
import { MonitorReport } from './Models/MonitorReport';
import MonitorPage from './Components/MonitorPage';
import { ProfileManager } from './Components/ProfileManager';
import { Provider } from './Models/Provider';

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
  isDumping: boolean;
  selectedSession: undefined | TraceSession;
  isShowMonitor: boolean;
  isManageProfile: boolean;
  selectedProfileForManage: Profile | undefined;
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
      selectedProfileForManage: undefined,
      isDumping: false,
      selectedSession: undefined,
      isShowMonitor: false,
      isManageProfile: false,
    };

    this.removeProvider = this.removeProvider.bind(this);
    this.appendProvider = this.appendProvider.bind(this);
    this.takeDumpAsync = this.takeDumpAsync.bind(this);
    this.selectProfile = this.selectProfile.bind(this);
    this.manageProfile = this.manageProfile.bind(this);

    this.goHome = this.goHome.bind(this);
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
      const { isShowMonitor, selectedSession, isManageProfile, profileArray } = this.state;
      if (!this.state.isReady) {
        return null;
      }

      if (isShowMonitor && selectedSession !== undefined) {
        content = <MonitorPage
          selectedEndpoint={this.state.baseUrl}
          traceSessionArray={this.state.traceSessionArray}
          isDumping={this.state.isDumping}
          processId={selectedSession.processId}
          sessionId={selectedSession.sessionId}
          exitMonitor={() => { this.setShowMonitoring(false); }}
          takeDumpAsync={this.takeDumpAsync}
          startProfilingAsync={this.startProfilingAsync}
          stopProfilingAsync={this.stopProfilingAsync}
          selectedProfile={this.state.selectedProfile}
          profileArray={this.state.profileArray}
          selectProfile={this.selectProfile}
          manageProfiles={() => this.manageProfile(true)}
          goHome={this.goHome}
        />
      }
      else if (isManageProfile) {
        content = <ProfileManager
          profileArray={profileArray}
          selectedProfile={this.state.selectedProfileForManage}
          setManageProfile={this.setManageProfile}
          addProfileAsync={this.addNewProfileAsync}
          refreshProfile={this.loadProfilesAsync}
          deleteProfileAsync={this.deleteProfileAsync}
          appendProvider={this.appendProvider}
          removeProvider={this.removeProvider}
        ></ProfileManager>
      } else {
        content = <>
          <div className='section'>
            <ConnectionStatus baseUrl={this.state.baseUrl}
              disconnectBackend={this.disconnectBackend}
            />
            <Processes
              refreshProcessAsync={this.loadProcessesAsync}
              startProfilingAsync={this.startProfilingAsync}
              startMonitoringAsync={this.startMonitoringAsync}
              takeDumpAsync={this.takeDumpAsync}
              processArray={this.state.processArray}
              isDumping={this.state.isDumping}
            />
            <TraceSessions
              traceSessions={this.state.traceSessionArray}
              stopProfilingAsync={this.stopProfilingAsync}
              stopMonitoringAsync={this.stopMonitoringAsync}
              loadTraceSessionsAsync={this.loadTraceSessionsAsync}
              setAsSelected={this.setSelectedSession} />
            <TraceRepo
              baseUrl={this.state.baseUrl}
              loadTraceFilesAsync={this.loadTraceFilesAsync}
              convertToSpeedscopeAsync={this.convertToSpeedscopeAsync}
              fileArray={this.state.traceFileArray}
            />
          </div>
        </>;
      }
    }

    return (
      <div className='dark-theme'>
        <AppHeader isHome={
          (!this.state.isBackendReady) ||
          (this.state.isBackendReady &&
            !this.state.isShowMonitor &&
            !this.state.isManageProfile)}
          goHome={this.goHome} />
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
      this.loadProfilesAsync(),
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

  // Monitoring
  private startMonitoringAsync: (processId: number) => Promise<boolean> = async (processId) => {
    const response = await fetch(`${this.state.baseUrl}/monitors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        processId
      }),
    });

    const result = !!response && response.ok;
    if (result) {
      await this.loadTraceSessionsAsync();
    }
    return result;
  }

  private stopMonitoringAsync: (processId: number, sessionId: number) => Promise<boolean> = async (processId, sessionId) => {
    const response = await fetch(`${this.state.baseUrl}/monitors`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        processId,
        id: sessionId,
      }),
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
    const response = await fetch(`${this.state.baseUrl}/sessions`);
    if (!!response && response.ok) {
      const result: TraceSession[] = await response.json();
      return result;
    }
    return [];
  }

  private setSelectedSession: (traceSession: TraceSession | undefined) => void = (selectedSession) => {
    const newState: Partial<AppState> = {
      selectedSession
    };
    if (selectedSession === undefined) {
      newState.isShowMonitor = false;
    } else if (!this.state.isShowMonitor) {
      newState.isShowMonitor = true;
    }
    this.setState(newState as AppState);
  }

  private getReportAsync: () => Promise<MonitorReport | undefined> = async () => {
    const { selectedSession } = this.state;
    if (selectedSession === undefined) {
      return undefined;
    }
    const response = await fetch(`${this.state.baseUrl}/Monitors/${selectedSession.processId}/${selectedSession.sessionId}`);
    if (!!response && response.ok) {
      const result: MonitorReport = await response.json();
      return result;
    } else {
      return undefined;
    }
  }

  private setShowMonitoring: (value: boolean) => void = (value) => {
    this.setState({
      isShowMonitor: value,
    });
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
      list = ['http://localhost:9400', 'http://apmexp-demo.southcentralus.azurecontainer.io'];
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
  private manageProfile: (value: boolean) => void = (value) => {
    this.setState({
      isManageProfile: value,
    });
  }

  private setManageProfile: (value: Profile | undefined) => void = (value) => {
    this.setState({
      selectedProfileForManage: value,
    });
  }

  private loadProfilesAsync: () => void = async () => {
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

  private addNewProfileAsync: (newProfile: Profile) => Promise<Profile> = async (newProfile) => {
    const response = await fetch(`${this.state.baseUrl}/profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newProfile),
    });
    if (!!response && response.ok) {
      return response.json();
    } else {
      const error = await response.json();
      alert(error);
    }
    return null;
  }

  /** Append a provider to selected profile */
  private appendProvider(newProvider: Provider) {
    const selectedProvider = Object.assign({}, this.state.selectedProfileForManage);
    selectedProvider.providers.push(newProvider);
    this.setState({
      selectedProfileForManage: selectedProvider,
    });

    this.updateProfileAsync();
  }

  // Remove a provider from selected profile
  private removeProvider(name: string): void {
    if (!name) return;
    const selectedProvider = Object.assign({}, this.state.selectedProfileForManage);
    selectedProvider.providers = selectedProvider.providers.filter(p => p.name !== name);
    this.setState({
      selectedProfileForManage: selectedProvider,
    });

    this.updateProfileAsync();
  }

  private updateProfileAsync: () => Promise<any> = async () => {
    if (!!this.state.selectedProfileForManage) {
      const newProfile = this.state.selectedProfileForManage;

      const response = await fetch(`${this.state.baseUrl}/profiles/${newProfile.name}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProfile),
      });
      if (!!response && response.ok) {
        return response.json();
      } else {
        const error = await response.json();
        if (error.title) {
          alert(error.title);
        } else {
          alert(error);
        }
      }
    } else {
      alert('No profile for updating...');
    }
  }

  private deleteProfileAsync: (name: string) => Promise<boolean> = async (name) => {
    const response = await fetch(`${this.state.baseUrl}/profiles/${encodeURI(name)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    let result: boolean = false;
    if (!!response && response.ok) {
      result = true;
    } else {
      const error = await response.json();
      alert(error);
    }
    return result;
  }

  // Dumps
  private takeDumpAsync: (processId: number, isMini: boolean) => Promise<any> = async (processId, isMini) => {
    this.setState({
      isDumping: true,
    });
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
      this.setState({ isDumping: false })
      return true;
    } else {
      alert('Failed to create the dump for this process: ' + processId);
      this.setState({ isDumping: false })
    }
    return false;
  }

  // Others
  private goHome: () => void = () => {
    this.setState({
      isShowMonitor: false,
      isManageProfile: false,
    });
  }
}