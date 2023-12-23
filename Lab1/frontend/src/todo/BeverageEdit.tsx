import React, { useContext, useEffect, useState } from 'react';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonLoading,
  IonPage,
  IonTitle,
  IonToolbar
} from '@ionic/react';
import { getLogger } from '../core';
import { BeverageContext } from './BeverageProvider';
import { RouteComponentProps } from 'react-router';
import { BeverageProps } from './beverageProps';

const log = getLogger('BeverageEdit');

interface BeverageEditProps extends RouteComponentProps<{
  id?: string;
}> {}

const BeverageEdit: React.FC<BeverageEditProps> = ({ history, match }) => {
  const { beverages, saving, savingError, saveBeverage } = useContext(BeverageContext);
  const [name, setName] = useState('');
  const [beverage, setBeverage] = useState<BeverageProps>();
  useEffect(() => {
    log('useEffect');
    const routeId = match.params.id || '';
    const beverage = beverages?.find(it => it.id === routeId);
    setBeverage(beverage);
    if (beverage) {
      setName(beverage.name);
    }
  }, [match.params.id, beverages]);
  const handleSave = () => {
    const editedBeverage = beverage ? { ...beverage, name } : { name };
    saveBeverage && saveBeverage(editedBeverage).then(() => history.goBack());
  };
  log('render');
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Edit</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleSave}>
              Save
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonInput value={name} onIonChange={e => setName(e.detail.value || '')} />
        <IonLoading isOpen={saving} />
        {savingError && (
          <div>{savingError.message || 'Failed to save beverage'}</div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default BeverageEdit;
