import React from 'react';
import { Profile } from '../Models/Profile';

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
                return <div key={index}>
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
                    <tr>
                        <th>Name</th>
                        <th>Keywords</th>
                        <th>EventLevel</th>
                        <th>filter</th>
                    </tr>
                    {selectedProfile.providers.map((provider, index) => {
                        return <tr key={index}>
                            <td>{provider.name}</td>
                            <td>{provider.keywords}</td>
                            <td>{provider.eventLevel}</td>
                            <td>{provider.filterData}</td>
                        </tr>;
                    })}
                </table>
            </>
        } else {
            profileDetails = <div>Select or create a profile first.</div>
        }

        return <div className='ProfileManager'>
            <div className='ProfileList'>
                {profileList}
            </div>
            <div className='ProfileDetails'>
                {profileDetails}
            </div>
        </div>
    }
}