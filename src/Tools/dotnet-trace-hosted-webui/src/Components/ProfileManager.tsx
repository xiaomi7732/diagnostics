import React, { ChangeEvent, FormEvent } from 'react';
import { Profile } from '../Models/Profile';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import './ProfileManager.css';
import { getId } from '@uifabric/utilities';

interface IProfileManagerProps {
    profileArray: Profile[] | undefined;
    selectedProfile: Profile | undefined;

    setManageProfile: (value: Profile | undefined) => void;
    addProfileAsync: (newProfile: Profile) => Promise<Profile>;
    refreshProfile: () => void;
}

interface IProfileManagerState {
    isShowNewProfileModel: boolean;
    newProfileName: string;
    newProfileDescription: string;
}

export class ProfileManager extends React.Component<IProfileManagerProps, IProfileManagerState> {
    private readonly _newProfileInputId = getId('_newProfileInputId');
    private readonly _newProfileDescriptionId = getId('_newProfileDescriptionId');

    constructor(props: IProfileManagerProps) {
        super(props);

        this.state = {
            isShowNewProfileModel: false,
            newProfileName: '',
            newProfileDescription: '',
        };
    }

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
            profileList = <div>
                {profileList}
                <Modal
                    isOpen={this.state.isShowNewProfileModel}
                    isBlocking={true}>
                    <div className='dialog-container dark-theme'>
                        <div className='title-container'>Add a Profile</div>
                        <div className='content-container' role='presentation'>
                            <form onSubmit={this.handleNewProfileSubmit}>
                                <div role='presentation'>
                                    <label htmlFor={this._newProfileInputId}>Profile Name:</label>
                                    <input id={this._newProfileInputId} type='input' value={this.state.newProfileName} onChange={this.handleNewProfileName}
                                        placeholder='New profile name.'></input>
                                </div>
                                <div role='presentation'>
                                    <label htmlFor={this._newProfileDescriptionId}>Description:</label>
                                    <input id={this._newProfileDescriptionId} type='input' value={this.state.newProfileDescription} onChange={this.handleNewProfileDescription}
                                        placeholder='Description of the Profile.'></input>
                                </div>
                                <div className='button-section'>
                                    <input type='submit' className='button' value='Submit' />
                                    <input type='button' className='button' value='Cancel' onClick={() => {
                                        this.setState({
                                            isShowNewProfileModel: false,
                                            newProfileName: '',
                                        });
                                    }} />
                                </div>
                            </form>
                        </div>
                    </div>
                </Modal>
            </div>
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
                <div className='HeaderContainer'>
                    <h2>Pick a Profile</h2>
                    &nbsp;(<div className='AddRemoveButton' onClick={() => this.setState({ isShowNewProfileModel: true })}>+</div>/<div>-</div>)
                </div>
                {profileList}
            </div>
            <div className='ProfileDetails'>
                {profileDetails}
            </div>

        </div>
    }

    private handleNewProfileName: ((event: ChangeEvent<HTMLInputElement>) => void) | undefined = (event) => {
        this.setState({
            newProfileName: event.target.value,
        });
    }

    private handleNewProfileDescription: ((event: ChangeEvent<HTMLInputElement>) => void) | undefined = (event) => {
        this.setState({
            newProfileDescription: event.target.value,
        });
    }

    private handleNewProfileSubmit: ((event: FormEvent<HTMLFormElement>) => void) | undefined = async (event) => {
        event.preventDefault();
        const result = await this.props.addProfileAsync({
            name: this.state.newProfileName,
            description: this.state.newProfileDescription,
            providers: []
        });

        if (result !== null) {
            this.setState({
                isShowNewProfileModel: false,
                newProfileDescription: '',
                newProfileName: '',
            });
            this.props.refreshProfile();
        }
    }
}