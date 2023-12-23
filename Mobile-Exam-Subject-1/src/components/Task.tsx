import { IonItem, IonLabel } from "@ionic/react";
import { TaskProps } from "../interfaces/TaskProps";

const Task: React.FC<TaskProps> = ({ text, status, version }) => {
    return (
      <IonItem>
        <IonLabel>{text}</IonLabel>
        <IonLabel>{status}</IonLabel>
        <IonLabel>{version}</IonLabel>
      </IonItem>
    );
  };
  
  export default Task;