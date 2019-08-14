import React, { Component } from 'react';
import './App.css';
import './Components/Processes'
import { Process } from './Models/Process';
import { Processes } from './Components/Processes';

interface AppState {
  processArray: Process[] | undefined;
  isReady: boolean;
}

export default class App extends Component<any, AppState>{
  constructor(props: any) {
    super(props);

    // Initial state
    this.state = {
      processArray: undefined,
      isReady: false,
    };

    this.initializeAsync();
  }
  render() {
    return this.state.isReady ? (
      <Processes
        refreshProcessAsync={this.refreshProcessesAsync}
        processArray={this.state.processArray}
      />
    ) : null;
  }

  private initializeAsync: () => Promise<any> = async () => {
    await this.refreshProcessesAsync();
    this.setState({
      isReady: true,
    });
  }

  private refreshProcessesAsync: () => Promise<any> = async () => {
    try {
      const processes = await this.loadProcessesAsync();
      this.setState({
        processArray: processes,
      });
    } catch (ex) {
      this.setState({
        processArray: undefined,
      });
    }
  }
  private loadProcessesAsync: () => Promise<Process[]> = async () => {
    const response = await fetch('https://localhost:5001/processes');
    if (!!response && response.ok) {
      const results: Process[] = await response.json();
      return results;
    }
    return [];
  }
}

