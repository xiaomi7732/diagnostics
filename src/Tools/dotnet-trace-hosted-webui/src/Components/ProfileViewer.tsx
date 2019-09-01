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
            content = (<div className='ProfileListContainer'><select>{
                this.props.profileArray.sort((a, b) => a > b ? 1 : -1).map((profile) => {
                    const selected = (this.props.selectedProfile !== undefined && this.props.selectedProfile === profile.name) ? true : undefined;
                    return <option key={profile.name} value={profile.name} selected={selected} onSelect={e => {
                        const target = e.target as any;
                        if (!!target && !!target.value) {
                            this.props.onSelected(target.value);
                        }
                    }}>{profile.name}: {profile.description}</option>;
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