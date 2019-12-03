import React, { PureComponent } from 'react';
import { Profile } from '../Models/Profile';
import './ProfilePicker.css';
import { ProfilePickerPanel } from './ProfilePickerPanel';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';

interface ProfileViewerProps {
    profileArray: Profile[] | undefined;
    selectedProfile: string | undefined;
    onSelected: (newValue: string) => void;
    onRefresh: () => void;
    manageProfile: () => void;
}

export default class ProfileViewer extends PureComponent<ProfileViewerProps, any> {
    render() {
        const { selectedProfile, onSelected, manageProfile } = this.props;
        let count = 0;
        let content;
        const profileArray = this.getValidProfile();

        if (profileArray !== undefined) {
            count = profileArray.length;
            content = (<div className='ProfileListContainer'>
                <ProfilePickerPanel
                    selectedProfile={selectedProfile}
                    selectProfile={onSelected}
                    profileArray={profileArray}
                    manageProfiles={manageProfile}
                    // Already at home.
                    goHome={() => { }}
                />
                <DefaultButton onClick={this.props.manageProfile}>Manage ...</DefaultButton>
            </div>);
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