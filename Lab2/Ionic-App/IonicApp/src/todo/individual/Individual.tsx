import { IonItem, IonLabel } from "@ionic/react";
import React from "react";
import {IndividualProps} from "./IndividualProps";

interface IndividualPropsExtended extends IndividualProps {
    onEdit: (_id? : string) => void;
}

const Individual: React.FC<IndividualPropsExtended> = ({_id: _id, name: name, age: age, vaccinated: vaccinated, onEdit}) => {
    return (
        <IonItem onClick={ () => onEdit(_id) }>
            {/* <IonLabel>{_id}</IonLabel> */}
            <IonLabel>{name}</IonLabel>
            <IonLabel>{age}</IonLabel>
            <IonLabel>{vaccinated.toString()}</IonLabel>
        </IonItem>
    )
};


export default Individual;