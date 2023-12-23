import { IonContent, IonList, IonPage } from "@ionic/react";
import React, { useEffect, useState } from "react";
import { MessageProps } from "../../interfaces/MessageProps";
import messageService from "../../services/messageService";
import Message from "../Message";

export const MessageList: React.FC = () => {
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
          {messages.map(({ id, text, read, sender, created }) => (
            <Message
              key={id}
              id={id}
              text={text}
              read={read}
              sender={sender}
              created={created}
            />
          ))}
        </IonList>
      </IonContent>
  );
};
