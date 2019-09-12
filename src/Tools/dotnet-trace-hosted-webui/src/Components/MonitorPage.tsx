import * as React from 'react';
import MonitorViz from './MonitorViz';
import { MonitorReport } from '../Models/MonitorReport';
import './MonitorPage.css';

interface MonitorPageProps {
    processId: number;
    sessionId: number;
    isDumping: boolean;

    exitMonitor: () => void;
    getReportAsync: () => Promise<MonitorReport | undefined>;
    takeDumpAsync: (processId: number, isMini: boolean) => Promise<any>;
}
const MonitorPage: React.FC<MonitorPageProps> = ({ processId,
    sessionId,
    getReportAsync,
    exitMonitor,
    takeDumpAsync,
    isDumping,
}) => {
    const dumpButtonClassName: string = 'button' + (isDumping ? ' disabled' : '');
    return <div className='monitor-page'>
        <div className='header'>
            <h2>Monitoring</h2>
            <h3>Session: {sessionId} Process: {processId}</h3>

            <input type='button' value='Heap Dump' className={dumpButtonClassName} onClick={async () => await takeDumpAsync(processId, false)}
                disabled={isDumping} />
            <input type='button' value='Mini Dump' className={dumpButtonClassName} onClick={async () => await takeDumpAsync(processId, true)}
                disabled={isDumping} />

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