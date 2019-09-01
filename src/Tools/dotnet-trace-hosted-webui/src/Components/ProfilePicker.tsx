import React, { PureComponent } from 'react';
import { Profile } from '../Models/Profile';
import './ProfilePicker.css';

interface ProfileViewerProps {
    profileArray: Profile[] | undefined;
    selectedProfile: string | undefined;
    onSelected: (newValue: string) => void;
    onRefresh: () => void;
}

export default class ProfileViewer extends PureComponent<ProfileViewerProps, any> {
    render() {
        let count = 0;
        let content;
        const profileArray = this.getValidProfile();

        if (profileArray !== undefined) {
            count = profileArray.length;
            content = (<div className='ProfileListContainer'><select value={this.props.selectedProfile} onChange={e => {
                const target = e.target as any;
                if (!!target && !!target.value) {
                    this.props.onSelected(target.value);
                }
            }}>{
                    profileArray.sort((a, b) => a > b ? 1 : -1).map((profile) => {
                        return <option key={profile.name} value={profile.name}>{profile.name}: {profile.description}</option>;
                    })
                }</select></div>);
        } else {
            content = "No tracing profile exist."
        }
        return <div className='profile-picker'>
            <div className='header'>
                <h2>Tracing Profiles ({count})</h2>
                <input className='button header-button refresh-button' type='button' onClick={this.props.onRefresh} value='&#x1f5d8;'></input>
            </div>
            {content}
        </div>
    }

    getValidProfile: () => Profile[] | undefined = () => {
        if (this.props.profileArray === undefined) {
            return undefined;
        }
        return this.props.profileArray.filter(p => p.name !== 'none');
    }
}