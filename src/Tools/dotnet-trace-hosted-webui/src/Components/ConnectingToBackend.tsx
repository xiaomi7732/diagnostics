import React, { Component } from 'react';

interface ConnectingToBackendProps {
    backendUrlArray: string[] | undefined,
    connectToBackendAsync: (url: string) => Promise<boolean>;
    addBackend: (newUrl: string) => void;
    removeBackend: (targetUrl: string) => void;
}

interface ConnectingToBackendState {
    errorMessage: string | undefined;
    isConnecting: boolean;
    newUrl: string;
}

export default class ConnectingToBackend extends Component<ConnectingToBackendProps, ConnectingToBackendState>{
    constructor(props: ConnectingToBackendProps) {
        super(props);
        this.state = {
            errorMessage: undefined,
            isConnecting: false,
            newUrl: '',
        };
    }
    render() {
        let content;
        if (this.props.backendUrlArray === undefined || this.props.backendUrlArray.length === 0) {
            content = <div>Please add backend.</div>
        } else {
            content = this.props.backendUrlArray.map((url, index) => {
                return <div key={index}>
                    <span>{url}</span>
                    <input className='button primary' type='button' value='Connect' onClick={async () => {
                        this.setState({
                            errorMessage: '',
                            isConnecting: true,
                        });
                        const result = await this.props.connectToBackendAsync(url);
                        if (!result) {
                            this.setState({
                                errorMessage: `Failed to connecting to backend: ${url}.`,
                                isConnecting: false,
                            });
                        }
                    }}></input>
                    <input className='button' type='button' value='Remove' onClick={async () => {
                        this.props.removeBackend(url);
                    }}></input>
                </div>
            })
        }

        return (
            <div>
                <div>
                    <h2>Pick a backend to connect to:</h2>
                    {content}
                    {!!this.state.isConnecting && <div>Connecting . . .</div>}
                    {!!this.state.errorMessage && <div>{this.state.errorMessage}</div>}
                </div>

                <div className='new-endpoint-container'>
                    <form onSubmit={this.handleAddBackend}>
                        <label htmlFor='newBackend'>Type in a new endpoint:</label>
                        <input className='text-input' id='newBackend' type='textbox' placeholder='http://localhost:9400'
                            value={this.state.newUrl} onChange={this.handleNewUrlChanged} />
                        <div>
                            <span className='tips'>Tips: Press enter to add the endpoint.</span>
                        </div>
                    </form>
                </div>
            </div>
        )
    }

    handleAddBackend = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const target = e.target as any;
        const newValue = target.newBackend.value;
        if (!!newValue) {
            this.props.addBackend(newValue);
            this.setState({
                newUrl: ''
            });
        }
    }

    handleNewUrlChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            newUrl: e.target.value,
        });
    }
}