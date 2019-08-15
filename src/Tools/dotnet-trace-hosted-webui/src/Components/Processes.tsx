import React, { Component, ReactNode } from 'react';
import Process from '../Models/Process';
interface ProcessesProps {
    refreshProcessAsync: () => Promise<void>;
    startProfilingAsync: (processId: number) => Promise<boolean>;
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
                return (<div key={index}>
                    <span>{process.id}</span>-<span>{process.name}</span>-<span>{process.mainModule}</span>
                    <input type='button' value='Start Profiling'
                        onClick={() => {
                            console.debug(`Start Profiling for session: ${process.id}`)
                            this.props.startProfilingAsync(process.id)
                        }} />
                </div>)
            });
        }

        return (<div>
            <h2>Process ({len})</h2>
            {content}
            <input type='button' onClick={this.handleRefresh} value='Refresh'></input>
        </div>
        );
    }

    private handleRefresh = async (event: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
        event.preventDefault();
        event.stopPropagation();
        this.props.refreshProcessAsync();
    }
}


