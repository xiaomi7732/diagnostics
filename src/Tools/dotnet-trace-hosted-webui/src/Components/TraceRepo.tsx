import React, { PureComponent } from 'react';
import TraceFile from '../Models/TraceFile';
import './TraceRepo.css';

interface TraceRepoProps {
    baseUrl: string;
    loadTraceFilesAsync: () => Promise<void>;
    fileArray: TraceFile[] | undefined;
}

export default class TraceRepo extends PureComponent<TraceRepoProps, {}>{
    render() {
        let content;
        let len: number = 0;
        if (this.props.fileArray === undefined || this.props.fileArray.length === 0) {
            content = <div>There's no trace file.</div>
        } else {
            len = this.props.fileArray.length;
            content = <div>
                {this.props.fileArray.sort((a, b) => {
                    return a.fileName > b.fileName ? -1 : 1;
                }).map((file, index) => {
                    return <div key={index} className='trace-file-line'>
                        <div className='trace-file'>
                            <a href={`${this.props.baseUrl}/TraceFiles/${file.fileName}`}>{file.fileName}</a>
                        </div>
                        <input className='button' type='button' value='Get speedscope file'></input>
                        <input className='button' type='button' value='Upload to SP Backend' onClick={() => alert(`Not implemented: ${file.fileName}`)} />
                    </div>
                })}
            </div>
        }
        return (<div>
            <h2>Trace Files ({len})</h2>
            {content}
            <input className='button' type='button' value='&#x1f5d8; Refresh' onClick={async () => await this.props.loadTraceFilesAsync()}></input>
        </div>)
    }
}