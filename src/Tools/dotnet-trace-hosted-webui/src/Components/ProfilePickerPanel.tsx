import * as React from 'react'
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { Panel, PanelType, IPanelProps } from 'office-ui-fabric-react/lib/Panel';
import { useConstCallback, useId } from '@uifabric/react-hooks';
import { Profile } from '../Models/Profile';
import { ChoiceGroup, IChoiceGroupOption } from 'office-ui-fabric-react/lib/ChoiceGroup';
import { Label } from 'recharts';

interface IProfilePickerPanelProps {
    selectedProfile: string | undefined,
    profileArray: Profile[] | undefined,

    selectProfile: (newValue: string) => void,
    manageProfiles: () => void,
    goHome: () => void,
}

export const ProfilePickerPanel: React.FunctionComponent<IProfilePickerPanelProps> = props => {
    const { selectedProfile, profileArray, selectProfile, manageProfiles, goHome } = props;
    const [isOpen, setIsOpen] = React.useState(false);
    const labelId = useId('profileListTitle');
    const labelProperties = {
        id: labelId,
    };

    const openPanel = useConstCallback(() => setIsOpen(true));
    const dismissPanel = useConstCallback(() => setIsOpen(false));
    const onManageProfiles = useConstCallback(() => {
        goHome();
        manageProfiles();
        dismissPanel();
    });

    const validProfileArray: Profile[] | undefined = !!profileArray ? profileArray.filter(p => !!p.name && p.name !== 'none') : undefined;
    const activeProfileDetails: Profile | undefined = !!validProfileArray ? validProfileArray.find(p => p.name === selectedProfile) : undefined;

    const onChange = (ev: React.FormEvent<HTMLElement | HTMLInputElement> | undefined, option: IChoiceGroupOption | undefined): void => {
        if (!!option && !!validProfileArray) {
            const newProfile = validProfileArray.find(p => p.name === option.key);
            if (!!newProfile) {
                if (!!selectProfile && selectedProfile === newProfile.name) {
                    return;
                }
                selectProfile(newProfile.name);
            }
        }
    }

    const onRenderFooterContent = useConstCallback(() => {
        return <div>
            <PrimaryButton onClick={dismissPanel}>OK</PrimaryButton>
            <DefaultButton onClick={onManageProfiles}>Manage</DefaultButton>
        </div>
    });

    return (
        <div style={{display: 'flex', alignItems: 'center', marginLeft: 8,}}>
            {!!selectedProfile&& <span>{selectedProfile}</span>}
            <DefaultButton text='Change' onClick={openPanel} />
            <Panel
                type={PanelType.medium}
                headerText={'Active Profile: ' + selectedProfile}
                isOpen={isOpen}
                isLightDismiss={true}
                onDismiss={dismissPanel}
                onRenderFooterContent={onRenderFooterContent}
                isFooterAtBottom={true}
                // You MUST provide this prop! Otherwise screen readers will just say "button" with no label.
                closeButtonAriaLabel="Close"
            >
                {!!activeProfileDetails && <div>{activeProfileDetails.description}</div>}

                <h3>Pick up a new profile</h3>
                {!!validProfileArray &&
                    <div>
                        <Label {...labelProperties}>
                            Pick up a new Profile:
                        </Label>
                        <ChoiceGroup
                            defaultSelectedKey={selectedProfile}
                            options={
                                validProfileArray.map(item => {
                                    return { key: item.name, text: item.name }
                                })
                            }
                            onChange={onChange}
                            ariaLabelledBy={labelId}
                        />
                    </div>
                }
            </Panel>
        </div>
    );
}