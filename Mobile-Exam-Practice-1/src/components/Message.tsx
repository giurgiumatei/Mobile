import { IonItem, IonLabel } from "@ionic/react";
import { MessageProps } from "../interfaces/MessageProps";

const Message: React.FC<MessageProps> = ({ text, read, sender, created }) => {
    return (
      <IonItem>
        <IonLabel>{text}</IonLabel>
        <IonLabel>{read}</IonLabel>
        <IonLabel>{sender}</IonLabel>
        <IonLabel>{created}</IonLabel>
      </IonItem>
    );
  };
  
  export default Message;