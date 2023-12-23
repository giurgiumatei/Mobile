import { IonItem, IonLabel } from "@ionic/react";
import { UserProps } from "../interfaces/UserProps";

const User: React.FC<UserProps> = ({ username }) => {
    return (
      <IonItem>
        <IonLabel>{username}</IonLabel>
      </IonItem>
    );
  };
  
  export default User;