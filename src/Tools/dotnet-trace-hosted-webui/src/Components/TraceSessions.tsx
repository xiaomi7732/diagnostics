import React, { PureComponent } from 'react';
import { TraceSession } from '../Models/TraceSession';

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
            list = <div>
                {this.props.traceSessions.map((session, index) => {
                    return (<div key={index}>
                        <span>ProcessId:</span>
                        <span>{session.processId}</span>&nbsp;
                        <span>SessionId:</span>
                        <span>{session.sessionId}</span>&nbsp;
                        <input type='button' value='Stop Profiling' onClick={() => {
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
            <input type='button' value='Refresh' onClick={this.props.loadTraceSessionsAsync} />
        </div>);
    }
}