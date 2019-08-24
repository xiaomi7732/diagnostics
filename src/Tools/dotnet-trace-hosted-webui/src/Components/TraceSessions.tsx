import React, { PureComponent } from 'react';
import { TraceSession } from '../Models/TraceSession';
import './TraceSessions.css';

interface TraceSessionsProps {
    loadTraceSessionsAsync: () => Promise<void>;
    stopProfilingAsync: (processId: number, sessionId: number) => Promise<boolean>;
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
                            <span className='bold-text'>ProcessId:</span>
                            <span>{session.processId}</span>&nbsp;
                        </div>
                        <div className='session-id-part'>
                            <span className='bold-text'>SessionId:</span>
                            <span>{session.sessionId}</span>&nbsp;
                        </div>
                        <input className='button' type='button' value='Stop Profiling' onClick={() => {
                            console.debug(`Stopping profiler: ${session.processId}:${session.sessionId}`);
                            this.props.stopProfilingAsync(session.processId, session.sessionId);
                        }} />
                    </div>);
                })}
            </div>
        }
        return (<div>
            <h2>Trace Sessions ({len})</h2>
            {list}
            <input className='button' type='button' value='&#x1f5d8; Refresh' onClick={this.props.loadTraceSessionsAsync} />
        </div>);
    }
}