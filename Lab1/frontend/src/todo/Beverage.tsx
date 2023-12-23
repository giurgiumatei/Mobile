import React from 'react';
import { IonItem, IonLabel } from '@ionic/react';
import { BeverageProps } from './beverageProps';

interface BeveragePropsExt extends BeverageProps {
  onEdit: (id?: string) => void;
}

const Beverage: React.FC<BeveragePropsExt> = ({ id, name, onEdit }) => {
  return (
    <IonItem onClick={() => onEdit(id)}>
      <IonLabel>{name}</IonLabel>
    </IonItem>
  );
};

export default Beverage;
