import React from 'react';
import { Profile } from '../Models/Profile';
import './ProfileManager.css';

interface IProfileManagerProps {
    profileArray: Profile[] | undefined;
    selectedProfile: Profile | undefined;

    setManageProfile: (value: Profile | undefined) => void;
}

export class ProfileManager extends React.Component<IProfileManagerProps, any> {
    componentDidMount() {
        if (!!this.props.profileArray && this.props.profileArray.length > 0 && !this.props.selectedProfile) {
            this.props.setManageProfile(this.props.profileArray[0]);
        }
    }

    render() {
        const { profileArray, selectedProfile } = this.props;
        const effectiveProfileArray = profileArray === undefined ? undefined : profileArray.filter(p => p.name !== 'none');

        let profileList = null;
        if (effectiveProfileArray !== undefined) {
            profileList = effectiveProfileArray.sort((p1, p2) => {
                if (p1.name > p2.name) return 1;
                return -1;
            }).map((profile, index) => {
                return <div className='ProfileNameRadioButton' key={index} title={profile.name}>
                    <input type='radio'
                        name='profileName'
                        value={profile.name}
                        checked={!!selectedProfile && selectedProfile.name === profile.name}
                        onChange={e => {
                            console.log(e.target.value);
                            if (!!e.target && !!e.target.value) {
                                const selected = effectiveProfileArray.find(p => p.name === e.target.value)
                                this.props.setManageProfile(selected);
                            }
                        }}
                    />{profile.name}
                </div>;
            });
        } else {
            profileList = <div>No profile.</div>
        }

        let profileDetails;
        if (!!selectedProfile) {
            profileDetails = <>
                <h2>
                    Profile: {selectedProfile.name}
                </h2>
                <div>{selectedProfile.description}</div>
                <h3>Providers</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Keywords</th>
                            <th>EventLevel</th>
                            <th>Filter</th>
                        </tr>
                    </thead>
                    <tbody>
                        {selectedProfile.providers.map((provider, index) => {
                            return <tr key={index}>
                                <td>{provider.name}</td>
                                <td>0x{parseInt(provider.keywords).toString(16)}</td>
                                <td>{provider.eventLevel}</td>
                                <td>{provider.filterData}</td>
                            </tr>;
                        })}
                    </tbody>
                </table>
            </>
        } else {
            profileDetails = <div>Select or create a profile first.</div>
        }

        return <div className='ProfileManager'>
            <div className='ProfileList'>
                <h2>Pick a Profile</h2>
                {profileList}
            </div>
            <div className='ProfileDetails'>
                {profileDetails}
            </div>
        </div>
    }
}