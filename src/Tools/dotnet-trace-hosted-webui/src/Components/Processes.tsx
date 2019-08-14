import React, { Component, ReactNode } from 'react';
import { Process } from '../Models/Process';
interface ProcessesProps {
    refreshProcessAsync: () => Promise<void>;
    startProfilingAsync: (processId: number) => Promise<boolean>;
    processArray: Process[] | undefined;
}

export class Processes extends Component<ProcessesProps, {}>{
    constructor(props: any) {
        super(props);

        this.state = {
            isLoading: true,
            isError: false,
            errorMessage: undefined,
        };
    }

    render(): ReactNode {
        if (this.props.processArray === undefined) {
            return null;
        }

        return (<div>
            <div>Processes:</div>
            <hr />
            {
                this.props.processArray.map((process: Process, index: number) => {
                    return (<div key={index}>
                        <span>{process.id}</span>-<span>{process.name}</span>-<span>{process.mainModule}</span>
                        <input type='button' value='Start Profiling'
                            onClick={() => {
                                console.debug(`Start Profiling for session: ${process.id}`)
                                this.props.startProfilingAsync(process.id)
                            }} />
                    </div>)
                })
            }
            <input type='button' onClick={this.handleRefresh} value='Refresh'></input>
            <hr />
        </div>
        );
    }

    private handleRefresh = async (event: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
        event.preventDefault();
        event.stopPropagation();
        this.props.refreshProcessAsync();
    }
}


