import { IonChip, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonInfiniteScroll, IonInfiniteScrollContent, IonItem, IonLabel, IonList, IonListHeader, IonLoading, IonPage, IonSearchbar, IonSelect, IonSelectOption, IonToast, IonToolbar } from "@ionic/react";
import React, { useContext, useEffect, useState } from "react";
import { Redirect, RouteComponentProps } from "react-router";
import { IndividualContext } from "./IndividualProvider";
import Individual from "./Individual";
import {add} from 'ionicons/icons';
import { AuthContext } from "../auth";
import { IndividualProps } from "./IndividualProps";
import { getLogger } from '../../core';
import {Network} from '@capacitor/core';

const log = getLogger('IndividualList');

const offset = 10;

const IndividualList : React.FC<RouteComponentProps> = ({history}) => {
    const { logout } = useContext(AuthContext)
    const {individuals, fetching, fetchingError} = useContext(IndividualContext);
    const [disableInfiniteScroll, setDisabledInfiniteScroll] = useState<boolean>(false);
    const [visibleIndividuals, setVisibleIndividuals] = useState<IndividualProps[] | undefined>([]);
    const [page, setPage] = useState(offset)
    const [filter, setFilter] = useState<boolean | undefined>(undefined);
    const [search, setSearch] = useState<string>("");
    const [status, setStatus] = useState<boolean>(true);

    const {savedOffline, setSavedOffline} = useContext(IndividualContext);

    Network.getStatus().then(status => setStatus(status.connected));

    Network.addListener('networkStatusChange', (status) => {
        setStatus(status.connected);
    })

    const vaccinationStatus = [true, false];

    useEffect(() => {
        if (individuals?.length && individuals?.length > 0) {
            setPage(offset);
            fetchData();
            console.log(individuals);
        }
    }, [individuals]);

    useEffect(() => {
        if (individuals && filter) {
            setVisibleIndividuals(individuals.filter(each => each.vaccinated === filter));
        }
    }, [filter]);

    useEffect(() => {
        if (search === "") {
            setVisibleIndividuals(individuals);
        }
        if (individuals && search !== "") {
            setVisibleIndividuals(individuals.filter(each => each.name.startsWith(search)));
        }
    }, [search])

    function fetchData() {
        setVisibleIndividuals(individuals?.slice(0, page + offset));
        setPage(page + offset);
        if (individuals && page > individuals?.length) {
            setDisabledInfiniteScroll(true);
            setPage(individuals.length);
        } else {
            setDisabledInfiniteScroll(false);
        }
    }

    async function searchNext($event: CustomEvent<void>) {
        fetchData();
        ($event.target as HTMLIonInfiniteScrollElement).complete();
    }


    
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonItem>
                    <IonSelect style={{ width: '40%' }} value={filter} placeholder="Vaccinated or Not" onIonChange={(e) => setFilter(e.detail.value)}>
                            {vaccinationStatus.map((each) => (
                                <IonSelectOption key={each == true ? "vaccinated" : "not vaccinated"} value={each}>
                                        {each == true ? "vaccinated" : "not vaccinated"}
                                </IonSelectOption>
                            ))}
                        </IonSelect>
                        <IonSearchbar style={{ width: '50%' }} placeholder="Search by name" value={search} debounce={200} onIonChange={(e) => {
                            setSearch(e.detail.value!);
                        }}>
                        </IonSearchbar>
                        <IonChip>
                        <IonLabel color={status? "success" : "danger"}>{status? "Online" : "Offline"}</IonLabel>
                    </IonChip>
                    </IonItem>
                    
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen>
                <IonLoading isOpen={fetching} message="This might take a moment..."/>

                {
                    visibleIndividuals &&(
                        
                        <IonList>
                            <IonListHeader>
                                {/* <IonLabel>ID</IonLabel> */}
                                <IonLabel>Name</IonLabel>
                                <IonLabel>Age</IonLabel>
                                <IonLabel>Vaccinated</IonLabel>
                                <IonLabel>Latitude</IonLabel>
                                <IonLabel>Longitude</IonLabel>
                                <IonLabel>Picture</IonLabel>
                            </IonListHeader>
                            {Array.from(visibleIndividuals)
                                .filter(each => {
                                    if (filter !== undefined)  
                                        return each.vaccinated === filter && each._id !== undefined;
                                    return each._id !== undefined;
                                })
                                .map(({_id, name, age, vaccinated, latitude, longitude, webViewPath}) => 
                                <Individual key={_id} _id={_id} name={name} age={age} vaccinated={vaccinated || false}  latitude={latitude} longitude={longitude} webViewPath={webViewPath} onEdit={_id => history.push(`/api/individuals/individual/${_id}`)} />)}
                        </IonList>
                    )
                }

                <IonInfiniteScroll threshold="100px" disabled={disableInfiniteScroll} onIonInfinite={(e: CustomEvent<void>) => searchNext(e)}>
                    <IonInfiniteScrollContent loadingText="Loading...">
                    </IonInfiniteScrollContent>
                </IonInfiniteScroll>

                {
                    fetchingError && (
                    <div>{fetchingError.message || 'Failed to fetch individuals'}</div>
                    )
                }

                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={() => history.push('/api/individuals/individual')}>
                        <IonIcon icon={add}/>
                    </IonFabButton>
                </IonFab>

                <IonFab vertical="bottom" horizontal="start" slot="fixed">
                    <IonFabButton onClick={handleLogout}>
                        LOGOUT
                    </IonFabButton>
                </IonFab>
                <IonToast
                    isOpen={savedOffline ? true : false}
                    message="Your changes will be visible on server when you get back online!"
                    duration={2000}/>
            </IonContent>
        </IonPage>
    );

    function handleLogout() {
        log("logout");
        logout?.();
    }
};


export default IndividualList;