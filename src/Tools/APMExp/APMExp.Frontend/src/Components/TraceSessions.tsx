import React, { PureComponent } from 'react';
import { TraceSession } from '../Models/TraceSession';
import './TraceSessions.css';

interface TraceSessionsProps {
    setAsSelected: (session: TraceSession) => void;
    loadTraceSessionsAsync: () => Promise<void>;
    stopProfilingAsync: (processId: number, sessionId: number) => Promise<boolean>;
    stopMonitoringAsync: (processId: number, sessionId: number) => Promise<boolean>;
    traceSessions: TraceSession[] | undefined;
}

export default class TraceSessions extends PureComponent<TraceSessionsProps, {}>{
    render() {
        let list;
        let len: number = 0;

        if (this.props.traceSessions === undefined || this.props.traceSessions.length === 0) {
            list = <div>There's no trace sessions.</div>
        }
        else {
            len = this.props.traceSessions.length;
            list = <div className='session-container'>
                {this.props.traceSessions.map((session, index) => {
                    return (<div className='session-line' key={index}>
                        <div className='process-id-part'>
                            <span className='bold-text'>ProcessId:&nbsp;</span>
                            <span>{session.processId}</span>
                        </div>
                        <div className='session-id-part'>
                            <span className='bold-text'>SessionId:&nbsp;</span>
                            <span>{session.sessionId}</span>
                        </div>
                        {session.type === 0 && <input className='button' type='button' value='&#x25A0; Stop Profiling' onClick={() => {
                            this.props.stopProfilingAsync(session.processId, session.sessionId);
                        }} />}
                        {session.type === 1 && <input className='button' type='button' value='&#x25A0; Stop Monitoring' onClick={() => {
                            this.props.stopMonitoringAsync(session.processId, session.sessionId);
                        }} />}
                        {session.type === 1 && <input className='button' type='button' value='&#x1F5E0; Visualize' onClick={() => {
                            this.props.setAsSelected(session);
                        }} />}
                    </div>);
                })}
            </div>
        }
        return (<div className='trace-session'>
            <div className='header'>
                <h2>Remote Trace Sessions ({len})</h2>
                <input className='button header-button' type='button' defaultValue='&#x1f5d8;' onClick={this.props.loadTraceSessionsAsync} />
            </div>
            {list}
        </div>);
    }
}