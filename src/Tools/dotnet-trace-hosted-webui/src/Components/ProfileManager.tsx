import React, { ChangeEvent, FormEvent } from 'react';
import { Profile } from '../Models/Profile';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import './ProfileManager.css';
import { getId } from '@uifabric/utilities';
import { Provider } from '../Models/Provider';

interface IProfileManagerProps {
    profileArray: Profile[] | undefined;
    selectedProfile: Profile | undefined;

    setManageProfile: (value: Profile | undefined) => void;
    addProfileAsync: (newProfile: Profile) => Promise<Profile>;
    deleteProfileAsync: (name: string) => Promise<boolean>;
    refreshProfile: () => void;
    appendProvider: (newProvider: Provider) => void;
    removeProvider: (name: string) => void;
}

interface IProfileManagerState {
    // New Profile
    isShowNewProfileModel: boolean;
    newProfileName: string;
    newProfileDescription: string;
    // Delete Profile
    isConfirmDeletingProfile: boolean;
    // Add Provider
    isShowAddProvider: boolean;
    newProvider: Provider & { keywordsHex: string };
}

export class ProfileManager extends React.Component<IProfileManagerProps, IProfileManagerState> {
    private readonly _newProfileInputId = getId('_newProfileInputId');
    private readonly _newProfileDescriptionId = getId('_newProfileDescriptionId');

    private readonly _newProviderNameId = getId('_newProviderNameId');
    private readonly _newProviderKeywordId = getId('_newProviderKeywordId');
    private readonly _newProviderEventLevelId = getId('_newProviderEventLevelId');
    private readonly _newProviderFilterId = getId('_newProviderFilterId');


    constructor(props: IProfileManagerProps) {
        super(props);

        this.state = {
            isShowNewProfileModel: false,
            isConfirmDeletingProfile: false,
            newProfileName: '',
            newProfileDescription: '',

            isShowAddProvider: false,
            newProvider: {
                name: '',
                keywords: 0,
                filterData: '',
                eventLevel: 5,
                keywordsHex: '0x0',
            }
        };
    }

    componentDidMount() {
        this.pickFirstProfile();
    }

    componentDidUpdate() {
        this.pickFirstProfile();
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
                <Modal isOpen={this.state.isConfirmDeletingProfile}
                    isBlocking={true} isDarkOverlay={true}>
                    <div className='dialog-container dark-theme'>
                        <div className='title-container'>Delete a Profile</div>
                        <div className='content-container' role='presentation'>
                            <form onSubmit={this.handleDeleteProfileSubmit}>
                                <span>Are you sure you want to delete the profile: {!!this.props.selectedProfile && this.props.selectedProfile.name}</span>
                                <div className='button-section'>
                                    <input type='submit' className='button' value='Yes' />
                                    <input type='button' className='button' value='No' onClick={() => {
                                        this.setState({
                                            isConfirmDeletingProfile: false,
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
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {selectedProfile.providers.map((provider, index) => {
                            return <tr key={provider.name}>
                                <td>{provider.name}</td>
                                <td>0x{provider.keywords.toString(16)}</td>
                                <td>{provider.eventLevel}</td>
                                <td>{provider.filterData}</td>
                                <td><input type='button' value='Delete' className='button' onClick={() => { this.handleRemoveProvider(provider.name); }} /></td>
                            </tr>;
                        })}
                    </tbody>
                </table>
                <input type='button' value='Add' className='button' onClick={() => this.setState({ isShowAddProvider: true })} />
                <Modal isOpen={this.state.isShowAddProvider} isBlocking={true} isDarkOverlay={true}>
                    <div className='dialog-container dark-theme'>
                        <div className='title-container'>Add a provider</div>
                        <div className='content-container' role='presentation'>
                            <form onSubmit={this.handleAddProvider}>
                                <table className='ProviderTable'>
                                    <tbody>
                                        <tr>
                                            <td><label htmlFor={this._newProviderNameId}>Name:</label></td>
                                            <td><input id={this._newProviderNameId}
                                                type='input'
                                                value={this.state.newProvider.name}
                                                onChange={this.handleChangeForNewProvider('name')}
                                                placeholder='New provider name'></input></td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor={this._newProviderKeywordId}>Keyword:</label>
                                            </td>
                                            <td>
                                                <input id={this._newProviderKeywordId}
                                                    type='input'
                                                    value={this.state.newProvider.keywordsHex} onChange={this.handleChangeForNewProvider('keywords')}
                                                    placeholder='Keywords'></input>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor={this._newProviderEventLevelId}>Event Level:</label>
                                            </td>
                                            <td>
                                                <select value={this.state.newProvider.eventLevel} onChange={this.handleChangeForNewProvider('eventLevel')}>
                                                    <option value={0}>Always Log</option>
                                                    <option value={1}>Critical</option>
                                                    <option value={2}>Error</option>
                                                    <option value={3}>Warning</option>
                                                    <option value={4}>Informational</option>
                                                    <option value={5}>Verbose</option>
                                                </select>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor={this._newProviderFilterId}>Filter:</label>
                                            </td>
                                            <td>
                                                <input id={this._newProviderFilterId} type='input'
                                                    value={this.state.newProvider.filterData}
                                                    onChange={this.handleChangeForNewProvider('filterData')}
                                                    placeholder='RegEx filter'></input>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <div className='button-section'>
                                    <input type='submit' className='button' value='OK' />
                                    <input type='button' className='button' value='Cancel' onClick={() => {
                                        this.setState({
                                            isShowAddProvider: false,
                                        });
                                    }} />
                                </div>
                            </form>
                        </div>
                    </div>
                </Modal>
                {!!this.props.selectedProfile && 
                <div className='profileRawText'>
                    <div>RAW:</div>
                    <textarea className='profileRawTextArea' readOnly value={JSON.stringify(this.props.selectedProfile)}></textarea>
                </div>}
            </>
        } else {
            profileDetails = <div>Select or create a profile first.</div>
        }

        return <div className='ProfileManager'>
            <div className='ProfileList'>
                <div className='HeaderContainer'>
                    <h2>Pick a Profile</h2>
                    &nbsp;(<div className='AddRemoveButton' onClick={() => this.setState({ isShowNewProfileModel: true })}>+</div>
                    /
                    <div className='AddRemoveButton' onClick={() => this.setState({ isConfirmDeletingProfile: true })}>-</div>)
                </div>
                {profileList}
            </div>
            <div className='ProfileDetails'>
                {profileDetails}
            </div>
        </div>
    }
    private handleRemoveProvider(name: string) {
        this.props.removeProvider(name);
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

    private pickFirstProfile() {
        if (!!this.props.profileArray && this.props.profileArray.length > 0 && !this.props.selectedProfile) {
            this.props.setManageProfile(this.props.profileArray[0]);
        }
    }

    private handleDeleteProfileSubmit: ((event: FormEvent<HTMLFormElement>) => void) | undefined = async (event) => {
        event.preventDefault();
        if (this.props.selectedProfile !== undefined) {
            const result = await this.props.deleteProfileAsync(this.props.selectedProfile.name);
            if (result) {
                this.setState({
                    isConfirmDeletingProfile: false,
                });
                this.props.setManageProfile(undefined);
                this.props.refreshProfile();
            } else {
                alert('Fail to delete profiler: ' + this.props.selectedProfile.name);
            }
        } else {
            alert('No selected profile.');
        }
    }

    private handleAddProvider: ((event: FormEvent<HTMLFormElement>) => void) | undefined = async (event) => {
        event.preventDefault();
        const { newProvider } = this.state;
        if (!!newProvider.name && !!newProvider.keywords) {
            this.props.appendProvider(newProvider);
            this.setState({
                newProvider: {
                    name: '',
                    keywords: 0,
                    eventLevel: 5,
                    filterData: '',
                    keywordsHex: '0x0',
                },
                isShowAddProvider: false,
            });
        } else {
            alert('Provider Name & Keywords are required.');
        }
    }

    handleChangeForNewProvider = (propertyName: string) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { newProvider } = this.state;
        const newState = {
            ...newProvider,
            [propertyName]: event.target.value
        };
        if (propertyName === 'keywords') {
            newState.keywordsHex = event.target.value;
            newState.keywords = parseInt(event.target.value, 16);
        }
        this.setState({ newProvider: newState });
    }
}