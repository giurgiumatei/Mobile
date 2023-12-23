import { IonContent, IonList, IonPage } from "@ionic/react";
import React, { useEffect, useState } from "react";
import { MessageProps } from "../../interfaces/MessageProps";
import messageService from "../../services/messageService";
import User from "../User";

export const UserList: React.FC = () => {
  const [messages, setMessages] = useState<MessageProps[]>([]);

  useEffect(() => {
    async function fetchMessages() {
      let messages = await messageService
        .getMessages()
        .then((response) => response.data);
      setMessages(messages);
    }

    fetchMessages();
  }, []);

  return (
      <IonContent>
        <IonList>
          {messages
            .filter(message => message.read === false)
            .sort(message => message.created).reverse()
            .map((message) => message.sender)
            .filter((x, i, a) => a.indexOf(x) === i)
            .map((username) => (
              <User username={username}></User>
            ))}
        </IonList>
        <IonList>
          {messages
            .filter(message => message.read === true)
            .map((message) => message.sender)
            .filter((x, i, a) => a.indexOf(x) === i)
            .map((username) => (
              <User username={username}></User>
            ))}
        </IonList>
      </IonContent>
  );
};
