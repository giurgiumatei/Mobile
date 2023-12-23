import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

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
import IndividualList from './todo/individual/IndividualList';
import { IndividualProvider } from './todo/individual/IndividualProvider';
import IndividualEdit from './todo/individual/IndividualEdit';
import { AuthProvider, Login, PrivateRoute } from './todo/auth';


const App: React.FC = () => (
    <IonApp>
        <IonReactRouter>
          <IonRouterOutlet>
            <AuthProvider>
              <Route path="/login" component={Login} exact={true}/>
              <IndividualProvider>
                <PrivateRoute path="/api/individuals/individuals" component={IndividualList} exact={true} />
                <PrivateRoute path="/api/individuals/individual" component={IndividualEdit} exact={true} />
                <PrivateRoute path="/api/individuals/individual/:_id" component={IndividualEdit} exact={true} />
              </IndividualProvider>
              <Route exact path="/" render={() => <Redirect to="/api/individuals/individuals" />} />
            </AuthProvider>
          </IonRouterOutlet>
        </IonReactRouter>
  </IonApp>
);

export default App;
 