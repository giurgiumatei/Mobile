import React, { useContext } from 'react';
import { RouteComponentProps } from 'react-router';
import {
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonList, IonLoading,
  IonPage,
  IonTitle,
  IonToolbar
} from '@ionic/react';
import { add } from 'ionicons/icons';
import Beverage from './Beverage';
import { getLogger } from '../core';
import { BeverageContext } from './BeverageProvider';

const log = getLogger('BeverageList');

const BeverageList: React.FC<RouteComponentProps> = ({ history }) => {
  const { beverages, fetching, fetchingError } = useContext(BeverageContext);
  log('render');
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>My App</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonLoading isOpen={fetching} message="Fetching beverages" />
        {beverages && (
          <IonList>
            {beverages.map(({ id, name}) =>
              <Beverage key={id} id={id} name={name} onEdit={id => history.push(`/beverage/${id}`)} />)}
          </IonList>
        )}
        {fetchingError && (
          <div>{fetchingError.message || 'Failed to fetch beverages'}</div>
        )}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => history.push('/beverage')}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default BeverageList;
