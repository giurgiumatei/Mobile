import React, { useCallback, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../core';
import { BeverageProps } from './beverageProps';
import { createBeverage, getBeverages, newWebSocket, updateBeverage } from './beverageApi';

const log = getLogger('BeverageProvider');

type SaveBeverageFn = (beverage : BeverageProps) => Promise<any>;

export interface BeveragesState {
  beverages?: BeverageProps[],
  fetching: boolean,
  fetchingError?: Error | null,
  saving: boolean,
  savingError?: Error | null,
  saveBeverage?: SaveBeverageFn,
}

interface ActionProps {
  type: string,
  payload?: any,
}

const initialState: BeveragesState = {
  fetching: false,
  saving: false,
};

const FETCH_BEVERAGES_STARTED = 'FETCH_BEVERAGES_STARTED';
const FETCH_BEVERAGES_SUCCEEDED = 'FETCH_BEVERAGES_SUCCEEDED';
const FETCH_BEVERAGES_FAILED = 'FETCH_BEVERAGES_FAILED';
const SAVE_BEVERAGE_STARTED = 'SAVE_BEVERAGE_STARTED';
const SAVE_BEVERAGE_SUCCEEDED = 'SAVE_BEVERAGE_SUCCEEDED';
const SAVE_BEVERAGE_FAILED = 'SAVE_BEVERAGE_FAILED';

const reducer: (state: BeveragesState, action: ActionProps) => BeveragesState =
  (state, { type, payload }) => {
    switch (type) {
      case FETCH_BEVERAGES_STARTED:
        return { ...state, fetching: true, fetchingError: null };
      case FETCH_BEVERAGES_SUCCEEDED:
        return { ...state, beverages: payload.beverages, fetching: false };
      case FETCH_BEVERAGES_FAILED:
        return { ...state, fetchingError: payload.error, fetching: false };
      case SAVE_BEVERAGE_STARTED:
        return { ...state, savingError: null, saving: true };
      case SAVE_BEVERAGE_SUCCEEDED:
        const beverages = [...(state.beverages || [])];
        const beverage = payload.beverage;
        const index = beverages.findIndex(it => it.id === beverage.id);
        if (index === -1) {
          beverages.splice(0, 0, beverage);
        } else {
          beverages[index] = beverage;
        }
        return { ...state, beverages: beverages, saving: false };
      case SAVE_BEVERAGE_FAILED:
        return { ...state, savingError: payload.error, saving: false };
      default:
        return state;
    }
  };

export const BeverageContext = React.createContext<BeveragesState>(initialState);

interface BeverageProviderProps {
  children: PropTypes.ReactNodeLike,
}

export const BeverageProvider: React.FC<BeverageProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { beverages, fetching, fetchingError, saving, savingError } = state;
  useEffect(getBeveragesEffect, []);
  useEffect(wsEffect, []);
  const saveBeverage = useCallback<SaveBeverageFn>(saveBeverageCallback, []);
  const value = { beverages, fetching, fetchingError, saving, savingError, saveBeverage };
  log('returns');
  return (
    <BeverageContext.Provider value={value}>
      {children}
    </BeverageContext.Provider>
  );

  function getBeveragesEffect() {
    let canceled = false;
    fetchBeverages();
    return () => {
      canceled = true;
    }

    async function fetchBeverages() {
      try {
        log('fetchBeverages started');
        dispatch({ type: FETCH_BEVERAGES_STARTED });
        const beverages = await getBeverages();
        log('fetchBeverages succeeded');
        if (!canceled) {
          dispatch({ type: FETCH_BEVERAGES_SUCCEEDED, payload: { beverages } });
        }
      } catch (error) {
        log('fetchBeverages failed');
        dispatch({ type: FETCH_BEVERAGES_FAILED, payload: { error } });
      }
    }
  }

  async function saveBeverageCallback(beverage: BeverageProps) {
    try {
      log('saveBeverage started');
      dispatch({ type: SAVE_BEVERAGE_STARTED });
      const savedBeverage = await (beverage.id ? updateBeverage(beverage) : createBeverage(beverage));
      log('saveBeverage succeeded');
      dispatch({ type: SAVE_BEVERAGE_SUCCEEDED, payload: { savedBeverage } });
    } catch (error) {
      log('saveBeverage failed');
      dispatch({ type: SAVE_BEVERAGE_FAILED, payload: { error } });
    }
  }

  function wsEffect() {
    let canceled = false;
    log('wsEffect - connecting');
    const closeWebSocket = newWebSocket(message => {
      if (canceled) {
        return;
      }
      const { event, payload: { beverage }} = message;
      log(`ws message, beverage ${event}`);
      if (event === 'created' || event === 'updated') {
        dispatch({ type: SAVE_BEVERAGE_SUCCEEDED, payload: { beverage } });
      }
    });
    return () => {
      log('wsEffect - disconnecting');
      canceled = true;
      closeWebSocket();
    }
  }
};
