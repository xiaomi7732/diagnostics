import React, { Component, ReactNode } from 'react';
import Process from '../Models/Process';
import './Processes.css';

interface ProcessesProps {
    refreshProcessAsync: () => Promise<void>;
    startProfilingAsync: (processId: number) => Promise<boolean>;
    takeDumpAsync: (processId: number, isMini: boolean) => Promise<boolean>;
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
            content = this.props.processArray.map((process: Process, index: number) => {
                return (<div className='process-line' key={index}>
                    <span className='process-id'>{process.id}</span> <span className='process-name'>{process.name}</span> <span className='process-path'>{process.mainModule}</span>
                    <input className='button' type='button' value='Start Profiling'
                        onClick={() => {
                            console.debug(`Start Profiling for session: ${process.id}`)
                            this.props.startProfilingAsync(process.id)
                        }} />

                    <input className='button' type='button' value='Mini Dump'
                        onClick={async () => {
                            await this.props.takeDumpAsync(process.id, true)
                        }} />
                    <input className='button' type='button' value='Heap Dump'
                        onClick={() => {
                            this.props.takeDumpAsync(process.id, false)
                        }} />
                </div>)
            });
        }

        return (<div className='processes'>
            <div className='header'>
                <h2>Remote Process ({len})</h2>
                <input className='button header-button refresh-button' type='button' onClick={this.handleRefresh} value='&#x1f5d8;'></input>
            </div>
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


