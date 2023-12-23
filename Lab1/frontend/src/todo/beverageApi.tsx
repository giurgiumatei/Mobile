import axios from 'axios';
import { getLogger } from '../core';
import { BeverageProps } from './beverageProps';

const log = getLogger('beverageApi');

const baseUrl = 'localhost:3000';
const beverageUrl = `http://${baseUrl}/beverage`;

interface ResponseProps<T> {
  data: T;
}

function withLogs<T>(promise: Promise<ResponseProps<T>>, fnName: string): Promise<T> {
  log(`${fnName} - started`);
  return promise
    .then(res => {
      log(`${fnName} - succeeded`);
      return Promise.resolve(res.data);
    })
    .catch(err => {
      log(`${fnName} - failed`);
      return Promise.reject(err);
    });
}

const config = {
  headers: {
    'Content-Type': 'application/json'
  }
};

export const getBeverages: () => Promise<BeverageProps[]> = () => {
  return withLogs(axios.get(beverageUrl, config), 'getBeverages');
}

export const createBeverage: ( beverage : BeverageProps) => Promise<BeverageProps[]> = beverage => {
  return withLogs(axios.post(beverageUrl, beverage, config), 'createBeverage');
}

export const updateBeverage: (beverage: BeverageProps) => Promise<BeverageProps[]> = beverage => {
  return withLogs(axios.put(`${beverageUrl}/${beverage.id}`, beverage, config), 'updateBeverage');
}

interface MessageData {
  event: string;
  payload: {
    beverage: BeverageProps;
  };
}

export const newWebSocket = (onMessage: (data: MessageData) => void) => {
  const ws = new WebSocket(`ws://${baseUrl}`)
  ws.onopen = () => {
    log('web socket onopen');
  };
  ws.onclose = () => {
    log('web socket onclose');
  };
  ws.onerror = error => {
    log('web socket onerror', error);
  };
  ws.onmessage = messageEvent => {
    log('web socket onmessage');
    onMessage(JSON.parse(messageEvent.data));
  };
  return () => {
    ws.close();
  }
}
