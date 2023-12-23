import { IonButton, IonButtons, IonContent, IonDatetime, IonHeader, IonInput, IonItem, IonLabel, IonLoading, IonPage, IonSelect, IonSelectOption, IonTitle, IonToggle, IonToolbar } from '@ionic/react';
import React, { useEffect } from 'react';
import { useContext, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import { IndividualContext } from './IndividualProvider';
import { getLogger } from '../../core';
import { IndividualProps } from './IndividualProps';
import moment from 'moment';

const log = getLogger('IndividualEdit');


interface IndividualEditProps extends RouteComponentProps<{
    _id?: string;
}> {}

const IndividualEdit: React.FC<IndividualEditProps> = ({history, match}) => {
    const {individuals, saving, savingError, saveIndividual } = useContext(IndividualContext);
    const [name, setName] = useState('');
    const [age, setAge] = useState(0);
    const [vaccinated, setVaccinated] = useState(false);
    const [individual, setIndividual] = useState<IndividualProps>();

    useEffect(() => {
        log('useEffect');
        const routeId = match.params._id || '';
        const individual = individuals?.find(it => it._id === routeId);
        setIndividual(individual);
        if (individual) {
            setName(individual.name);
            setAge(individual.age);
            setVaccinated(individual.vaccinated);
        }
    }, [match.params._id, individuals]);

    const handleSave = () => {
        log('entered handleSave');
        const editedIndividual = individual ? {...individual, name: name, age: age, vaccinated: vaccinated } : { name: name, age: age, vaccinated: vaccinated };
        console.log(editedIndividual);
        saveIndividual && saveIndividual(editedIndividual).then(() => {history.goBack()});
    };

     return (
     <IonPage>
        <IonHeader>
            <IonToolbar>
                <IonTitle>Edit individual</IonTitle>
                <IonButtons slot="end">
                    <IonButton onClick={handleSave}>Save</IonButton>
                </IonButtons>
            </IonToolbar>
        </IonHeader>
        <IonContent>
            <IonItem>
                <IonLabel>ID:  </IonLabel>
                <IonInput hidden={individual === undefined}  placeholder="id" value={match.params._id} readonly/>
            </IonItem>
            <IonItem>
                <IonLabel>Name:  </IonLabel>
                <IonInput placeholder="name" value={name} onIonChange={e => setName(e.detail.value || '')}/>
            </IonItem>
            <IonItem>
                <IonLabel>Age:  </IonLabel>
                <IonInput placeholder="age" value={age} onIonChange={e => setAge(+(e.detail.value ?? 0))}/>
            </IonItem>
            <IonItem>
                <IonLabel>Vaccinated: </IonLabel>
                <IonToggle checked={vaccinated} onIonChange={e => setVaccinated(e.detail.checked)}/>
            </IonItem>
            <IonLoading isOpen={saving}/>
            {savingError && (
                <div>{savingError?.message || 'Failed to save individual'}</div>
            )}
        </IonContent>
     </IonPage>
    );
};


export default IndividualEdit;