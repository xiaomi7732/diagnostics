import React, { PureComponent } from 'react';
import { Profile } from '../Models/Profile';

interface ProfileViewerProps {
    profileArray: Profile[] | undefined;
    selectedProfile: string | undefined;
    onSelected: (newValue: string) => void;
}

export default class ProfileViewer extends PureComponent<ProfileViewerProps, any> {
    render() {
        let content;
        if (this.props.profileArray !== undefined) {
            content = (<div className='ProfileListContainer'><select value={this.props.selectedProfile} onChange={e => {
                const target = e.target as any;
                if (!!target && !!target.value) {
                    this.props.onSelected(target.value);
                }
            }}>{
                    this.props.profileArray.sort((a, b) => a > b ? 1 : -1).map((profile) => {
                        return <option key={profile.name} value={profile.name}>{profile.name}: {profile.description}</option>;
                    })
                }</select></div>);
        } else {
            content = "No tracing profile exist."
        }
        return <div className='ProfileViewer'>
            <h2>Tracing Profiles</h2>
            {content}
        </div>
    }
}