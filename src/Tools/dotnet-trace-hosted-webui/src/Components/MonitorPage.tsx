import * as React from 'react';
import MonitorViz from './MonitorViz';
import './MonitorPage.css';
import { TraceSession } from '../Models/TraceSession';
import * as signalR from "@aspnet/signalr";

interface MonitorPageProps {
    processId: number;
    sessionId: number;
    isDumping: boolean;
    traceSessionArray: TraceSession[] | undefined;
    selectedEndpoint: string;

    exitMonitor: () => void;
    takeDumpAsync: (processId: number, isMini: boolean) => Promise<any>;
    startProfilingAsync: (processId: number) => Promise<boolean>;
    stopProfilingAsync: (processId: number, sessionId: number) => Promise<boolean>;
}

interface MonitorPageStates {
    report: Map<string, number[]>;
    counterHub: signalR.HubConnection | null;
}

class MonitorPage extends React.Component<MonitorPageProps, MonitorPageStates> {
    constructor(props: MonitorPageProps) {
        super(props);


        let connection: signalR.HubConnection | null = new signalR.HubConnectionBuilder()
            .withUrl(`${this.props.selectedEndpoint}/counterHub`)
            .build();

        connection.on("updateCounterAsync", this.onUpdate);

        connection.start().catch(err => { alert(err); connection = null; });

        this.state = {
            report: new Map(),
            counterHub: connection,
        }
    }

    componentWillUnmount() {
        if(this.state.counterHub!==null){
            this.state.counterHub.stop();
        }
    }

    render() {
        const { processId,
            sessionId,
            exitMonitor,
            takeDumpAsync,
            isDumping,
            traceSessionArray,
            startProfilingAsync,
            stopProfilingAsync,
        } = this.props;

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
                <MonitorViz report={this.state.report} />
            </div>
        </div>
    }

    private onUpdate:
        (processId: number, sessionId: number, metricName: string, metricValue: number) => void
        = (processId, sessionId, metricName, metricValue) => {
            if (processId === this.props.processId && sessionId === this.props.sessionId) {
                const newReport = this.reportCache;
                if (newReport.has(metricName)) {
                    // Exists
                    const array = newReport.get(metricName);
                    if (array != null) {
                        while (array.length >= 60) {
                            array.pop();
                        }
                        array.push(metricValue);
                        newReport.set(metricName, array);
                    }
                } else {
                    // Doesn't exist
                    newReport.set(metricName, [metricValue]);
                }

                // Update no frequent than 1 second.
                this.reportCache = newReport;
                if (this.lastUpdate === undefined) {
                    this.lastUpdate = new Date();
                    this.setState({
                        report: newReport,
                    });
                } else {
                    const now = new Date();
                    const delta = now.getTime() - this.lastUpdate.getTime();
                    if (delta >= 500) {
                        this.lastUpdate = now;

                        console.debug('Report:');
                        newReport.forEach((v, k) => {
                            console.debug(`${k}:${v.length}`);
                        });

                        this.setState({
                            report: newReport
                        });
                    }
                }
            }
        }

    private reportCache: Map<string, number[]> = new Map();
    private lastUpdate: Date | undefined = undefined;
}

export default MonitorPage;