import React, { Component, ReactNode } from 'react';
import { Process } from '../Models/Process';

interface ProcessesState {
    isLoading: boolean;
    isError: boolean;
    errorMessage: string | undefined;
    processArray: Process[];

};

export class Processes extends Component<any, ProcessesState>{
    constructor(props: any) {
        super(props);

        this.state = {
            isLoading: true,
            isError: false,
            processArray: [],
            errorMessage: undefined,
        };

        try {
            this.initializeAsync();
        } catch{
            this.setState({
                isError: true,
            });
        }
    }

    render(): ReactNode {
        if (this.state.isLoading) {
            return (<div>Loading . . .</div>);
        } else if (this.state.isError) {
            return (<div>Error: {this.state.errorMessage}</div>);
        };

        return (<div>
            <div>Processes:</div>
            <hr />
            {
                this.state.processArray.map((process: Process, index: number) => {
                    return (<div key={index}>
                        <span>{process.id}</span>-<span>{process.name}</span>-<span>{process.mainModule}</span>
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
        await this.initializeAsync();
    }

    private initializeAsync = async () => {
        try {
            const processes = await this.loadProcessesAsync();
            this.setState({
                isLoading: false,
                isError: false,
                processArray: processes,
            });
        } catch (ex) {
            this.setState({
                isLoading: false,
                isError: true,
                errorMessage: !!ex && !!ex.message && ex.message
            });
        }
    }

    private loadProcessesAsync = async () => {
        const response = await fetch('https://localhost:5001/processes');
        if (!!response && response.ok) {
            const results: Process[] = await response.json();
            return results;
        }
        return [];
    }
}


