import React, { PureComponent } from 'react';
import TraceFile from '../Models/TraceFile';
import './TraceRepo.css';

interface TraceRepoProps {
    baseUrl: string;
    loadTraceFilesAsync: () => Promise<void>;
    convertToSpeedscopeAsync: (fileName: string) => Promise<boolean>;
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
                    const fileFormat = file.fileName.toLowerCase().endsWith('.nettrace') ? 'nettrace' : 'speedscope';
                    return <div key={index} className='trace-file-line'>
                        <div className='trace-file'>
                            <a href={`${this.props.baseUrl}/TraceFiles/${file.fileName}`}>{file.fileName}</a>
                        </div>
                        {(fileFormat === 'nettrace') && <input className='button' type='button' value='Get speedscope file' onClick={() => this.props.convertToSpeedscopeAsync(file.fileName)}></input>}
                        {/* <input className='button' type='button' value='Upload to SP Backend' onClick={() => alert(`Not implemented: ${file.fileName}`)} /> */}
                    </div>
                })}
            </div>
        }
        return (<div className='trace-repo'>
            <div className='header'>
                <h2>Remote Trace Files ({len})</h2>
                <input className='button header-button' type='button' value='&#x1f5d8;' onClick={async () => await this.props.loadTraceFilesAsync()}></input>
            </div>
            <div className='speed-scope-tips'>
                To open trace in <a href='https://speedscope.app' target='_blank'>speedscope</a>, download the <span>speedscope.json</span> files to your local box and upload it to <a href='https://speedscope.app' target='_blank'>speedscope.app</a>.
            </div>
            {content}

        </div>)
    }
}