import React from 'react';
import { MonitorReport } from '../Models/MonitorReport';
import { AreaChart, YAxis, XAxis, CartesianGrid, Area, Tooltip } from 'recharts';
import './MonitorViz.css';
import { CounterScores } from '../Models/CounterScores';

interface MonitorVizProps {
    getReportAsync: () => Promise<MonitorReport | undefined>,
}

interface MonitorVizState {
    width: number;
    report: MonitorReport | undefined;
    interval: NodeJS.Timeout | null;
}

export default class MonitorViz extends React.Component<MonitorVizProps, MonitorVizState> {
    constructor(props: MonitorVizProps) {
        super(props);

        this.state = {
            report: undefined,
            width: 0,
            interval: null,
        };
    }

    async componentDidMount() {
        const interval = await this.loadDataAsync();
        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);
        this.setState({
            interval
        });
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions);
        if (this.state.interval !== null) {
            clearInterval(this.state.interval);
        }
    }

    render() {
        const { report, width } = this.state;

        let content;
        if (report === undefined) {
            content = <div className='data-loading-message'>Visualization data not available.</div>
        } else {
            let chartWidth = width < 600 ? width - 24 : width / 3 - 8;
            if (chartWidth < 300) {
                chartWidth = 300;
            }
            content = <>{
                Object.keys(report).sort(this.metricsNameComparer).map((metricName, idxKey) => {
                    const reportItem = (report as unknown as { [key: string]: number[] })[metricName];
                    const data = reportItem.map((point, index) => {
                        return { key: metricName, value: point, x: index };
                    }) as ReadonlyArray<object>;

                    return <div key={idxKey} style={{ display: 'flex', flexFlow: 'column' }} >
                        <h4 className='chart-title'>{metricName}</h4>
                        <AreaChart
                            width={chartWidth}
                            height={400}
                            data={data}
                            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                        >
                            <defs>
                                <linearGradient id="areaColor" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#005697" stopOpacity={0.6} />
                                    <stop offset="95%" stopColor="#005697" stopOpacity={.2} />
                                </linearGradient>
                            </defs>
                            <XAxis stroke='white' dataKey='x' type='number' />
                            <YAxis stroke='white' type='number' />
                            <CartesianGrid strokeDasharray="5 2" vertical={false} strokeWidth='1' stroke='#888888' />
                            <Tooltip wrapperStyle={{ color: 'blue', backgroundColor: 'red' }} isAnimationActive={false} />
                            <Area type="monotone" dataKey="value" strokeWidth={2} stroke="#005697" fillOpacity={1} fill="url(#areaColor)"
                                isAnimationActive={false}>
                            </Area>
                        </AreaChart>
                    </div>
                })
            }
            </>
        }

        return <div className='monitor-viz'>
            {content}
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

    private metricsNameComparer: (name1: string, name2: string) => number = (name1, name2) => {
        const fallback = 1000000;
        const n1Score = this.getScore(name1, fallback);
        const n2Score = this.getScore(name2, fallback);
        return n1Score - n2Score;
    }

    private getScore: (name: string, fallBack: number) => number = (name, fallBack) => {
        let score = fallBack;
        for (let counterScore in CounterScores) {
            if (name.startsWith(counterScore)) {
                score = +CounterScores[counterScore];
                break;
            }
        }
        if (score === fallBack) {
            console.warn(name + ' is an unknown metrics.');
        }
        return score;
    }
}