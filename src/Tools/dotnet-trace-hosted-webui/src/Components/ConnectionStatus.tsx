import React from 'react';

interface ConnectionStatusProps {
    baseUrl: string;

    disconnectBackend: () => void;
}

export const ConnectionStatus = (props: ConnectionStatusProps) => (
    <div className='connection-status'>
        <h2>Connection</h2>
        <span>&#x1f5a7; You are connecting to: {props.baseUrl}</span>
        <input className='button' type='button' onClick={props.disconnectBackend} value='Disconnect'></input>
    </div>
);