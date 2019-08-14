import React, { PureComponent } from 'react';
import TraceFile from '../Models/TraceFile';

interface TraceRepoProps {
    loadTraceFilesAsync: () => Promise<void>;
    fileArray: TraceFile[] | undefined;
}

export default class TraceRepo extends PureComponent<TraceRepoProps, {}>{
    render() {
        let content;
        if (this.props.fileArray === undefined || this.props.fileArray.length === 0) {
            content = <div>There's no trace file.</div>
        } else {
            content = <div>
                {this.props.fileArray.sort((a, b) => {
                    return a.fileName > b.fileName ? -1 : 1;
                }).map((file, index) => {
                    return <div key={index}>
                        <a href={`https://localhost:5001/TraceFiles/${file.fileName}`}>{file.fileName}</a>
                    </div>
                })}
            </div>
        }
        return (<div>
            <h2>Trace Files</h2>
            {content}
            <input type='button' value='Refresh' onClick={async ()=> await this.props.loadTraceFilesAsync()}></input>
        </div>)
    }
}