import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { BeverageEdit, BeverageList } from './todo';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import { BeverageProvider } from './todo/BeverageProvider';

const App: React.FC = () => (
  <IonApp>
    <BeverageProvider>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route path="/beverages" component={BeverageList} exact={true} />
          <Route path="/beverage" component={BeverageEdit} exact={true} />
          <Route path="/bevare/:id" component={BeverageEdit} exact={true} />
          <Route exact path="/" render={() => <Redirect to="/beverages" />} />
        </IonRouterOutlet>
      </IonReactRouter>
    </BeverageProvider>
  </IonApp>
);

export default App;
