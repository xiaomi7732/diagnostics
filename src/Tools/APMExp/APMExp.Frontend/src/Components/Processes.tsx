import React, { Component, ReactNode } from 'react';
import Process from '../Models/Process';
import './Processes.css';

interface ProcessesProps {
    refreshProcessAsync: () => Promise<void>;
    startProfilingAsync: (processId: number) => Promise<boolean>;
    startMonitoringAsync: (processId: number) => Promise<boolean>;
    takeDumpAsync: (processId: number, isMini: boolean) => Promise<boolean>;
    isDumping: boolean;
    processArray: Process[] | undefined;
}

export default class Processes extends Component<ProcessesProps, {}>{
    render(): ReactNode {
        let content;
        let len = 0;

        if (this.props.processArray === undefined || this.props.processArray.length === 0) {
            content = (<div>
                There is no .NET Core processes.
            </div>);
        } else {
            len = this.props.processArray.length;
            const dumpButtonClassName: string = 'button' + (this.props.isDumping ? ' disabled' : '');
            content = this.props.processArray.map((process: Process, index: number) => {
                return (
                    <div className='process-line' key={index}>
                        <span className='process-id'>{process.id}</span>
                        <div className='process-info'>
                            <div className='process-name'>{process.name}</div>
                            <div className='process-path'>{process.mainModule}</div>
                        </div>
                        <input className='button' type='button' value='&#x25B6; Monitor'
                            onClick={() => {
                                this.props.startMonitoringAsync(process.id);
                            }} />

                        <input className={dumpButtonClassName} type='button' value='&#128248; Mini Dump' disabled={this.props.isDumping}
                            onClick={async () => {
                                await this.props.takeDumpAsync(process.id, true)
                            }} />
                        <input className={dumpButtonClassName} type='button' value='&#128248; Heap Dump' disabled={this.props.isDumping}
                            onClick={async () => {
                                await this.props.takeDumpAsync(process.id, false)
                            }} />
                    </div>)
            });
        }

        return (<div className='processes'>
            <div className='header'>
                <h2>Remote Process ({len})</h2>
                <input className='button header-button refresh-button' type='button' onClick={this.handleRefresh} value='&#x1f5d8;'></input>
            </div>
            <div>
                To begin monitoring, pick up a process and press the Monitor button.
            </div>
            {this.props.isDumping ? <div>Dump in progress . . .</div> : null}
            {content}
        </div>
        );
    }

    private handleRefresh = async (event: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
        event.preventDefault();
        event.stopPropagation();
        this.props.refreshProcessAsync();
    }
}


