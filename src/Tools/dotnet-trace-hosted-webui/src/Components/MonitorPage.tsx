import * as React from 'react';
import MonitorViz from './MonitorViz';
import { MonitorReport } from '../Models/MonitorReport';
import './MonitorPage.css';
import { TraceSession } from '../Models/TraceSession';

interface MonitorPageProps {
    processId: number;
    sessionId: number;
    isDumping: boolean;
    traceSessionArray: TraceSession[] | undefined;

    exitMonitor: () => void;
    getReportAsync: () => Promise<MonitorReport | undefined>;
    takeDumpAsync: (processId: number, isMini: boolean) => Promise<any>;
    startProfilingAsync: (processId: number) => Promise<boolean>;
    stopProfilingAsync: (processId: number, sessionId: number) => Promise<boolean>;
}
const MonitorPage: React.FC<MonitorPageProps> = ({ processId,
    sessionId,
    getReportAsync,
    exitMonitor,
    takeDumpAsync,
    isDumping,
    traceSessionArray,
    startProfilingAsync,
    stopProfilingAsync,
}) => {
    const dumpButtonClassName: string = 'button' + (isDumping ? ' disabled' : '');
    const profilingSession = traceSessionArray === undefined ? undefined :
        traceSessionArray.find(session => session.processId === processId && session.processId !== sessionId && session.type === 0);
    return <div className='monitor-page'>
        <div className='header'>
            <h2>Monitoring</h2>
            <h3>Session: {sessionId} Process: {processId}</h3>

            <input type='button' value='Heap Dump' className={dumpButtonClassName} onClick={async () => await takeDumpAsync(processId, false)}
                disabled={isDumping} />
            <input type='button' value='Mini Dump' className={dumpButtonClassName} onClick={async () => await takeDumpAsync(processId, true)}
                disabled={isDumping} />

            {!!profilingSession &&
                <input type='button' value='Stop Profiling' className={dumpButtonClassName} onClick={async () => {
                    if (profilingSession !== undefined) {
                        await stopProfilingAsync(profilingSession.processId, profilingSession.sessionId);
                    }
                }}
                />}
            {!profilingSession &&
                <input type='button' value='Start Profiling' className={dumpButtonClassName} onClick={async () => {
                    await startProfilingAsync(processId);
                }}
                />}
            <input type='button' value='Back' className='button' onClick={exitMonitor} />
        </div>
        <div className='viz'>
            <MonitorViz
                getReportAsync={getReportAsync} />
        </div>
    </div>
}

MonitorPage.defaultProps = {
    processId: 0,
    sessionId: 0,
}

export default MonitorPage;