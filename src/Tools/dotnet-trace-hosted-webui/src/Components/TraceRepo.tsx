import React, { PureComponent } from 'react';
import TraceFile from '../Models/TraceFile';

interface TraceRepoProps {
    fileArray: TraceFile[] | undefined;
}

export default class TraceRepo extends PureComponent<TraceRepoProps, {}>{
    render() {
        let content;
        if (this.props.fileArray === undefined) {
            content = <div>There's no trace file.</div>
        } else {
            content = <div>
                {this.props.fileArray.sort((a, b) => {
                    return a.fileName > b.fileName ? -1 : 1;
                }).map((file, index) => {
                    return <div key={index}>
                        <span>{file.fileName}</span>
                        <input type='button' value='Download' />
                    </div>
                })}
            </div>
        }
        return (<div>
            <h2>Trace Files</h2>
            {content}
        </div>)
    }
}