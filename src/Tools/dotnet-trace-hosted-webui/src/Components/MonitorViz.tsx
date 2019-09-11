import React from 'react';
import { MonitorReport } from '../Models/MonitorReport';
import { AreaChart, YAxis, XAxis, CartesianGrid, Area, Tooltip } from 'recharts';

interface MonitorVizProps {
    processId: number,
    sessionId: number,

    getReportAsync: () => Promise<MonitorReport | undefined>,
}

interface MonitorVizState {
    width: number;
    report: MonitorReport | undefined;
}

export default class MonitorViz extends React.Component<MonitorVizProps, MonitorVizState> {
    private _timer: NodeJS.Timeout | null = null;

    constructor(props: MonitorVizProps) {
        super(props);

        this.state = {
            report: undefined,
            width: 0
        };
    }

    async componentDidMount() {
        this._timer = await this.loadDataAsync();
        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions);
        this._timer = null;
    }

    render() {
        const { processId, sessionId } = this.props;
        const { report, width } = this.state;

        let content;
        if (report === undefined) {
            content = <div>No visualize data yet.</div>
        } else {
            content = <div>{
                Object.keys(report).map(metricName => {
                    const reportItem = (report as unknown as { [key: string]: number[] })[metricName];
                    const data = reportItem.map((point, index) => {
                        return { key: metricName, value: point, x: index };
                    }) as ReadonlyArray<object>;

                    return <div>
                        <h4 className='chart-title'>{metricName}</h4>
                        <AreaChart
                            width={width - 150}
                            height={400}
                            data={data}
                            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                        >
                            <defs>
                                <linearGradient id="areaColor" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#FFC100" stopOpacity={0.6} />
                                    <stop offset="95%" stopColor="#FFC100" stopOpacity={.2} />
                                </linearGradient>
                            </defs>
                            <XAxis stroke='white' dataKey='x' type='number' />
                            <YAxis stroke='white' type='number' />
                            <CartesianGrid strokeDasharray="5 2" vertical={false} strokeWidth='1' stroke='#888888' />
                            <Tooltip wrapperStyle={{ color: 'blue', backgroundColor: 'red' }} isAnimationActive={false} />
                            <Area type="monotone" dataKey="value" strokeWidth={2} stroke="#FFC100" fillOpacity={1} fill="url(#areaColor)"
                                isAnimationActive={false}>
                            </Area>
                        </AreaChart>
                    </div>
                })
            }
            </div>
        }

        return <div>
            <div role='group'>
                <h2>Process Monitor</h2>
                <h3>Process: {processId} Session: {sessionId}</h3>
            </div>
            <div>
                {content}
            </div>
        </div>;
    }

    private loadDataAsync = async (): Promise<NodeJS.Timeout> => {
        return setInterval(async () => {
            const report = await this.props.getReportAsync();
            this.setState({
                report,
            });
        }, 500);
    }

    private updateWindowDimensions = () => {
        this.setState({ width: window.innerWidth });
    }
}