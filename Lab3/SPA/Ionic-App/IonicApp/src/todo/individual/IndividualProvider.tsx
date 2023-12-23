import React, { useCallback, useContext, useEffect, useReducer, useState } from "react";
import { IndividualProps } from "./IndividualProps";
import PropTypes from 'prop-types';
import { getIndividuals, createIndividual, editIndividual, createWebSocket, syncData } from "./IndividualApi";
import { getLogger } from '../../core';
import { AuthContext } from "../auth";
import { Plugins } from "@capacitor/core";

const log = getLogger('IndividualProvider');
const { Storage } = Plugins;

export type saveIndividualFunction = (individual : any) => Promise<any>;

export interface IndividualsState {
    individuals? : IndividualProps[],
    fetching: boolean,
    fetchingError? : Error | null,
    saving: boolean,
    savingError? : Error | null,
    saveIndividual? : saveIndividualFunction,
    connectedNetwork?: boolean,
    setSavedOffline?: Function,
    savedOffline?: boolean
};

interface ActionProps {
    type: string,
    payload? : any
};

const initialState: IndividualsState = {
    fetching: false,
    saving: false
};

const FETCH_INDIVIDUALS_STARTED = 'FETCH_INDIVIDUALS_STARTED';
const FETCH_INDIVIDUALS_SUCCEEDED = 'FETCH_INDIVIDUALS_SUCCEEDED';
const FETCH_INDIVIDUALS_FAILED = 'FETCH_INDIVIDUALS_FAILED';
const SAVE_INDIVIDUAL_STARTED = 'SAVE_INDIVIDUAL_STARTED';
const SAVE_INDIVIDUAL_SUCCEEDED = 'SAVE_INDIVIDUAL_SUCCEEDED';
const SAVE_INDIVIDUAL_FAILED = 'SAVE_INDIVIDUAL_FAILED';

const reducer: (state: IndividualsState, action: ActionProps) => IndividualsState = 
(state, {type, payload}) => {
    switch(type) {
        case FETCH_INDIVIDUALS_STARTED:
            return {...state, fetching: true, fetchingError: null};
        case FETCH_INDIVIDUALS_SUCCEEDED:
            return {...state, individuals: payload.individuals, fetching: false};
        case FETCH_INDIVIDUALS_FAILED:
            return {...state, individuals: payload.individuals, fetching: false};
        case SAVE_INDIVIDUAL_STARTED:
            return {...state, savingError: null, saving: true};
        case SAVE_INDIVIDUAL_SUCCEEDED:
            const individuals = [...(state.individuals || [])]
            const individual = payload.individual;
            individuals.forEach(it => console.log(it));
            const index = individuals.findIndex(it => it._id === individual._id);
            if (index === -1) {
                individuals.splice(0, 0, individual);
            } else {
                individuals[index] = individual;
            }
            return {...state, individuals: individuals, saving: false};
        case SAVE_INDIVIDUAL_FAILED:
            return {...state, savingError: payload.error, saving: false};
        default:
            return state;
    }
};

export const IndividualContext = React.createContext<IndividualsState>(initialState);

interface IndividualProviderProps {
    children: PropTypes.ReactNodeLike
}

const {Network} = Plugins;

export const IndividualProvider: React.FC<IndividualProviderProps> = ({children}) => {
    const { token } = useContext(AuthContext);

    const [connectedNetworkStatus, setConnectedNetworkStatus] = useState<boolean>(false);
    Network.getStatus().then(status => setConnectedNetworkStatus(status.connected));
    const [savedOffline, setSavedOffline] = useState<boolean>(false);
    useEffect(networkEffect, [token, setConnectedNetworkStatus]);

    const [state, dispatch] = useReducer(reducer, initialState);
    const { individuals: individuals, fetching, fetchingError, saving, savingError } = state;
    useEffect(getIndividualsEffect, [token]);
    useEffect(ws, [token])
    const saveIndividual = useCallback<saveIndividualFunction>(saveIndividualCallback, [token]);
    const value  = {
        individuals, 
        fetching, 
        fetchingError, 
        saving, 
        savingError, 
        saveIndividual, 
        connectedNetworkStatus, 
        savedOffline, 
        setSavedOffline 
    };
    return (
        <IndividualContext.Provider value={value}>
        {children}
        </IndividualContext.Provider>
    );

    function networkEffect() {
        console.log("network effect");
        let canceled = false;
        Network.addListener('networkStatusChange', async (status) => {
            if (canceled) return;
            const connected = status.connected;
            if (connected) {
                console.log("networkEffect - SYNC data");
                await syncData(token);
            }
            setConnectedNetworkStatus(status.connected);
        });
        return () => {
            canceled = true;
        }
    }

    function getIndividualsEffect() {
        let canceled = false;
        fetchIndividuals();
        return () => {
            canceled = true;
        }

        async function fetchIndividuals() {
            let canceled = false;
            fetchIndividuals();
            return () => {
                canceled = true;
            }

            async function fetchIndividuals() {
                if (!token?.trim()) return;
                if (!navigator?.onLine) {
                    let storageKeys = Storage.keys();
                    const individuals = await storageKeys.then(async function (storageKeys) {
                        const saved = [];
                        for (let i = 0; i < storageKeys.keys.length; i++) {
                            if (storageKeys.keys[i] !== "token") {
                                const individual = await Storage.get({key : storageKeys.keys[i]});
                                if (individual.value != null)
                                    var parsedIndividual = JSON.parse(individual.value);
                                saved.push(parsedIndividual);
                            }
                        }
                        return saved;
                    });
                    dispatch({type: FETCH_INDIVIDUALS_SUCCEEDED, payload: {individuals}});
                } else {
                    try {
                        log('fetchIndividuals started');
                        dispatch({type: FETCH_INDIVIDUALS_STARTED});
                        const individuals = await getIndividuals(token);
                        log('fetchIndividuals successful');
                        if (!canceled) {
                            dispatch({type: FETCH_INDIVIDUALS_SUCCEEDED, payload: {individuals}})
                        }
                    } catch (error) {
                        let storageKeys = Storage.keys();
                        const individuals = await storageKeys.then(async function (storageKeys) {
                            const saved = [];
                            for (let i = 0; i < storageKeys.keys.length; i++) {
                                if (storageKeys.keys[i] !== "token") {
                                    const individual = await Storage.get({key : storageKeys.keys[i]});
                                    if (individual.value != null)
                                        var parsedIndividual = JSON.parse(individual.value);
                                    saved.push(parsedIndividual);
                                }
                            }
                            return saved;
                        });
                        dispatch({type: FETCH_INDIVIDUALS_SUCCEEDED, payload: {individuals}});
                    }
                }
                
            }
        }
    }


    async function saveIndividualCallback(individual: IndividualProps) {
        try {
            if (navigator.onLine) {
                log('saveIndividual started');
                dispatch({ type: SAVE_INDIVIDUAL_STARTED });
                const updatedIndividual = await (individual._id ? editIndividual(token, individual) : createIndividual(token, individual))
                log('saveIndividual successful');
                dispatch({type: SAVE_INDIVIDUAL_SUCCEEDED, payload: {individual: updatedIndividual}});
            }
            
            else {
                console.log('saveIndividual offline');
                log('saveIndividual failed');
                individual._id = (individual._id == undefined) ? ('_' + Math.random().toString(36).substr(2, 9)) : individual._id;
                await Storage.set({
                    key: individual._id!,
                    value: JSON.stringify({
                      _id: individual._id,
                      name: individual.name,
                      age: individual.age,
                      vaccinated: individual.vaccinated,
                      latitude: individual.latitude,
                      longitude: individual.longitude,
                      webViewPath: individual.webViewPath
                      })
                  });
                dispatch({type: SAVE_INDIVIDUAL_SUCCEEDED, payload: {individual : individual}});
                setSavedOffline(true);
            }
        }
        catch(error) {
            log('saveIndividual failed');
            await Storage.set({
                key: String(individual._id),
                value: JSON.stringify(individual)
            })
            dispatch({type: SAVE_INDIVIDUAL_SUCCEEDED, payload: {individual}});
        }
    }

    function ws() {
        let canceled = false;
        log('wsEffect - connecting');
        let closeWebSocket: () => void;
        if (token?.trim()) {
          closeWebSocket = createWebSocket(token, message => {
            if (canceled) {
              return;
            }
            const { type, payload: individual } = message;
            log(`ws message, individual ${type}`);
            if (type === 'created' || type === 'updated') {
              dispatch({ type: SAVE_INDIVIDUAL_SUCCEEDED, payload: { individual } });
            }
          });
        }
        return () => {
          log('wsEffect - disconnecting');
          canceled = true;
          closeWebSocket?.();
        }
    }
}
