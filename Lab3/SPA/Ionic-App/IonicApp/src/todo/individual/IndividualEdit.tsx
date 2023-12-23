import { IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonLoading, IonPage, IonTitle, IonToggle, IonToolbar } from '@ionic/react';
import React, { useEffect } from 'react';
import { useContext, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import { IndividualContext } from './IndividualProvider';
import { IndividualProps } from './IndividualProps';
import {MyMap} from '../../core/MyMap';
import {useMyLocation} from '../../core/useMyLocation';
import {usePhotoGallery} from '../../core/usePhotoGallery';


interface IndividualEditProps extends RouteComponentProps<{
    _id?: string;
}> {}

const IndividualEdit: React.FC<IndividualEditProps> = ({history, match}) => {
    const {individuals, saving, savingError, saveIndividual } = useContext(IndividualContext);
    const [name, setName] = useState('');
    const [age, setAge] = useState(0);
    const [vaccinated, setVaccinated] = useState(false);
    const [individual, setIndividual] = useState<IndividualProps>();

    const [latitude, setLatitude] = useState<number | undefined>(undefined);
    const [longitude, setLongitude] = useState<number | undefined>(undefined);
    const [currentLatitude, setCurrentLatitude] = useState<number | undefined>(undefined);
    const [currentLongitude, setCurrentLongitude] = useState<number | undefined>(undefined);
    const [webViewPath, setWebViewPath] = useState('');

    const location = useMyLocation();
    const {latitude : lat, longitude : lng} = location.position?.coords || {};

    const {takePhoto} = usePhotoGallery();

    useEffect(() => {
        log('useEffect');
       // individuals?.forEach(individual => console.log(individual._id))
        const routeId = match.params._id || '';
        log(routeId)
        const individual = individuals?.find(it => it._id === routeId);
        setIndividual(individual);
        if (individual) {
            setName(individual.name);
            setAge(individual.age);
            setVaccinated(individual.vaccinated);
            setLatitude(individual.latitude);
            setLongitude(individual.longitude);
            setWebViewPath(individual.webViewPath);
        }
    }, [match.params._id, individuals]);

    useEffect(() => {
        if (latitude === undefined && longitude === undefined) {
            setCurrentLatitude(lat);
            setCurrentLongitude(lng);
        } else {
            setCurrentLatitude(latitude);
            setCurrentLongitude(longitude);
        }
    }, [lat, lng, longitude, latitude]);

    const handleSave = () => {
        log('entered handleSave');
        const editedIndividual = individual ? {...individual, name: name, age: age, vaccinated: vaccinated, latitude: latitude, longitude: longitude, webViewPath: webViewPath  } : { name: name, age: age, vaccinated: vaccinated, latitude: latitude, longitude: longitude, webViewPath: webViewPath  };
        console.log(editedIndividual);
        saveIndividual && saveIndividual(editedIndividual).then(() => {history.goBack()});
    };

    async function handlePhotoChange() {
        const image = await takePhoto();
        if (!image) {
            setWebViewPath('');
        } else {
            setWebViewPath(image);
        }
    }

    function setLocation() {
        setLatitude(currentLatitude);
        setLongitude(currentLongitude);
    }

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

            <IonItem>
                <IonLabel>Show us where you got the individual from!</IonLabel>
                <IonButton onClick={setLocation}>Set location</IonButton>
            </IonItem>

            {webViewPath && (<img onClick={handlePhotoChange} src={webViewPath} width={'100px'} height={'100px'}/>)}
            {!webViewPath && (<img onClick={handlePhotoChange} src={'https://static.thenounproject.com/png/187803-200.png'} width={'100px'} height={'100px'}/>)}

            {lat && lng &&
                <MyMap
                   lat={currentLatitude}
                   lng={currentLongitude}
                   onMapClick={log('onMap')}
                   onMarkerClick={log('onMarker')}
                />
            }

            <IonLoading isOpen={saving}/>
            {savingError && (
                <div>{savingError?.message || 'Failed to save individual'}</div>
            )}
        </IonContent>
     </IonPage>
    );

    function log(source: string) {
        return (e: any) => {
        setCurrentLatitude(e.latLng.lat());
        setCurrentLongitude(e.latLng.lng());
        console.log(source, e.latLng.lat(), e.latLng.lng());
        }
    }
};




export default IndividualEdit;