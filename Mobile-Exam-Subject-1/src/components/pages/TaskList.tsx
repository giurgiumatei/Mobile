import { IonContent, IonInput, IonList, IonPage } from "@ionic/react";
import React, { useEffect, useState } from "react";
import { TaskProps } from "../../interfaces/TaskProps";
import taskService from "../../services/taskService";
import Task from "../Task";

export const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<TaskProps[]>([]);
  const [text, setText] = useState<string>();

  useEffect(() => {
    async function fetchMessages() {
      if (text !== undefined) {
        let tasks = await taskService
          .getTask(text)
          .then((response) => response.data);
        setTasks(tasks);
      }
    }

    fetchMessages();
  }, [text]);

  return (
    <IonPage>
      <IonContent>
        <IonInput
          value={text}
          placeholder="Enter Input"
          onIonChange={(e) => setText(e.detail.value!)}
          clearInput
        ></IonInput>
        <IonList>
          {tasks.map((task) => (
            <Task
              key={task.id}
              id={task.id}
              text={task.text}
              version={task.version}
              status={task.status}
            ></Task>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};
