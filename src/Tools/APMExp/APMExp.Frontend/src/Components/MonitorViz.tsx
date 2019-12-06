import React from 'react';
import { AreaChart, YAxis, XAxis, CartesianGrid, Area, Tooltip } from 'recharts';
import './MonitorViz.css';
import { CounterScores } from '../Models/CounterScores';
import { ColorPalette } from '../Models/ColorPalette';

interface MonitorVizProps {
    report: Map<string, number[]>;
}

interface MonitorVizState {
    width: number;
}

export default class MonitorViz extends React.Component<MonitorVizProps, MonitorVizState> {
    constructor(props: MonitorVizProps) {
        super(props);

        this.state = {
            width: 0,
        };
    }

    async componentDidMount() {
        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions);
    }

    render() {
        const { width } = this.state;
        const { report } = this.props;
        let content;
        if (report === undefined || report.size === 0) {
            content = <div className='data-loading-message'>Visualization data not available.</div>
        } else {
            let chartWidth = width < 600 ? width - 24 : width / 3 - 8;
            if (chartWidth < 300) {
                chartWidth = 300;
            }
            let chartHeight = chartWidth * 2 / 4;
            if (chartHeight < 200) {
                chartHeight = 200;
            }

            content = <>{
                Array.from(report.keys()).sort(this.metricsNameComparer).map((metricName, idxKey) => {
                    const reportItem = report.get(metricName);
                    if (reportItem !== undefined) {
                        const data = reportItem.map((value, index) => { return { key: metricName, value: value, x: index } }) as ReadonlyArray<object>;
                        const color = ColorPalette[idxKey % (Object.keys(ColorPalette).length / 2)];

                        return <div key={idxKey} style={{ display: 'flex', flexFlow: 'column' }} >
                            <h4 className='chart-title'>{metricName}</h4>
                            <AreaChart
                                width={chartWidth}
                                height={chartHeight}
                                data={data}
                                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                            >
                                <defs>
                                    <linearGradient id={color} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={color} stopOpacity={0.6} />
                                        <stop offset="95%" stopColor={color} stopOpacity={.2} />
                                    </linearGradient>
                                </defs>
                                <XAxis stroke='white' dataKey='x' type='number' />
                                <YAxis stroke='white' type='number' />
                                <CartesianGrid strokeDasharray="5 2" vertical={false} strokeWidth='1' stroke='#888888' />
                                <Tooltip wrapperStyle={{ color: 'blue', backgroundColor: 'red' }} isAnimationActive={false} />
                                <Area type="monotone" dataKey="value" strokeWidth={2} stroke={color} fillOpacity={1} fill={"url(#" + color + ")"}
                                    isAnimationActive={false}>
                                </Area>
                            </AreaChart>
                        </div>
                    } else {
                        return null;
                    }
                })
            }
            </>
        }

        return <div className='monitor-viz'>
            {content}
        </div>;
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
        if (name === null || name === undefined) {
            return fallBack;
        }
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