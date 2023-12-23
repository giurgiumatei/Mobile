import axios from 'axios';
import { authConfig, getLogger, withLogs } from '../../core';
import { IndividualProps } from './IndividualProps';
import { Plugins} from '@capacitor/core';

const log = getLogger('individualApi');
const { Storage } = Plugins;

const url = 'localhost:3000';
const baseUrl = `http://${url}/api/individuals`;


interface MessageData {
  type: string;
  payload: IndividualProps;
}

const different = (individual1: any, individual2: any) => {
    if (individual1.name === individual2.name && individual1.age === individual2.age && individual1.vaccinated === individual2.vaccinated)
      return false;
    return true;
}

export const syncData: (token: string) => Promise<IndividualProps[]> = async token => {
  try {
    const { keys } = await Storage.keys();
    var result = axios.get(`${baseUrl}/individuals`, authConfig(token));
    result.then(async result => {
      keys.forEach(async i => {
        if (i !== 'token') {
          const individualOnServer = result.data.find((each: { _id: string; }) => each._id === i);
          const individualLocal = await Storage.get({key: i});

          if (individualOnServer !== undefined && different(individualOnServer, JSON.parse(individualLocal.value!))) {  // actualizare
            console.log('UPDATE ' + individualLocal.value);
            axios.put(`${baseUrl}/individual/${i}`, JSON.parse(individualLocal.value!), authConfig(token));
          } else if (individualOnServer === undefined){  // creare
            console.log('CREATE' + individualLocal.value!);
            axios.post(`${baseUrl}/individual`, JSON.parse(individualLocal.value!), authConfig(token));
          }
        }
        })
    }).catch(err => {
      if (err.response) {
        console.log('client received an error response (5xx, 4xx)');
      } else if (err.request) {
        console.log('client never received a response, or request never left');
      } else {
        console.log('anything else');
      }
  })
    return withLogs(result, 'syncIndividuals');
  } catch (error) {
    throw error;
  }    
}

export const getIndividuals: (token: string) => Promise<IndividualProps[]> = token => {  
  try {
    var result = axios.get(`${baseUrl}/individuals`, authConfig(token));
    result.then(async result => {
      for (const each of result.data) {
          await Storage.set({
            key: each._id!,
            value: JSON.stringify({
              _id: each._id,
              name: each.name,
              age: each.age,
              vaccinated: each.vaccinated,
              latitude: each.latitude,
              longitude: each.longitude,
              webViewPath: each.webViewPath
            })
          });
      }
    }).catch(err => {
      if (err.response) {
        console.log('client received an error response (5xx, 4xx)');
      } else if (err.request) {
        console.log('client never received a response, or request never left');
      } else {
        console.log('anything else');
      }
  })
    return withLogs(result, 'getIndividuals');
  } catch (error) {
    throw error;
  }    
}

export const createIndividual: (token: string, individual: IndividualProps) => Promise<IndividualProps[]> = (token, individual) => {
    var result = axios.post(`${baseUrl}/individual`, individual, authConfig(token));
    result.then(async result => {
      var one = result.data;
      await Storage.set({
        key: one._id!,
        value: JSON.stringify({
          _id: one._id,
          name: one.name,
          age: one.age,
          vaccinated: one.vaccinated,
          latitude: one.latitude,
          longitude: one.longitude,
          webViewPath: one.webViewPath
          })
      });
    }).catch(err => {
      if (err.response) {
        console.log('client received an error response (5xx, 4xx)');
      } else if (err.request) {
        alert('client never received a response, or request never left');
      } else {
        console.log('anything else');
      }
  });
    return withLogs(result, 'createIndividual');
}

export const editIndividual: (token: string, individual: IndividualProps) => Promise<IndividualProps[]> = (token, individual) => {
    var result = axios.put(`${baseUrl}/individual/${individual._id}`, individual, authConfig(token));
    result.then(async result => {
      var one = result.data;
      await Storage.set({
        key: one._id!,
        value: JSON.stringify({
          _id: one._id,
          name: one.name,
          age: one.age,
          vaccinated: one.vaccinated,
          latitude: one.latitude,
          longitude: one.longitude,
          webViewPath: one.webViewPath
          })
      }).catch(err => {
        if (err.response) {
          alert('client received an error response (5xx, 4xx)');
        } else if (err.request) {
          alert('client never received a response, or request never left');
        } else {
          alert('anything else');
        }
    })
    });
    return withLogs(result, 'updateIndividual');
}

export const createWebSocket = (token: string, onMessage: (data: MessageData) => void) => {
    const ws = new WebSocket(`ws://${url}`);
    ws.onopen = () => {
      log('web socket onopen');
      ws.send(JSON.stringify({ type: 'authorization', payload: { token } }));
    };
    ws.onclose = function (event) {
      console.log(event);
      log('web socket onclose');
    };
    ws.onerror = error => {
      log('web socket onerror', error);
      ws.close();
    };
    ws.onmessage = messageEvent => {
      log('web socket onmessage');
      onMessage(JSON.parse(messageEvent.data));
    };
    return () => {
      ws.close();
    }
  }