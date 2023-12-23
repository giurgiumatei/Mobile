import { IonContent, IonPage } from "@ionic/react";
import React from "react"
import { UserList } from "./UserList";


export const Home : React.FC = () => {
    return(
        <IonPage>
        <UserList>
        </UserList>
        </IonPage>
    );
}