import * as React from 'react';
import * as ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';
import * as firebase from 'firebase';
import './index.css';
import './App.css';
import { PageLoadingComponent } from './components/PageLoadingComponent';
import { Button, Classes, NonIdealState, Spinner } from '@blueprintjs/core';
import Lodable from 'react-loadable';

const config = {
  apiKey: 'AIzaSyAllrgyA84f4uqeN23GiXukrwP7B6w37dU',
  authDomain: 'sc17-gatech-optica.firebaseapp.com',
  databaseURL: 'https://sc17-gatech-optica.firebaseio.com',
  projectId: 'sc17-gatech-optica',
  storageBucket: 'sc17-gatech-optica.appspot.com',
  messagingSenderId: '772306227863'
};
firebase.initializeApp(config);

const AsyncMain = Lodable({
  loader: () => import('./MainApp'),
  loading: PageLoadingComponent,
});

class App extends React.Component<{}, { hasUser: boolean, userInfoFetched: boolean }> {

  constructor() {
    super();
    this.state = {
      userInfoFetched: false,
      hasUser: false,
    };
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.setState({userInfoFetched: true, hasUser: true});
      } else {
        this.setState({userInfoFetched: true, hasUser: false});
      }
    });
  }

  render() {
    if (!this.state.userInfoFetched) {
      return (
        <div className="App">
          <Spinner className="initial-spinner"/>
        </div>
      );
    }
    if (!this.state.hasUser) {
      return (
        <div className="App">
          <NonIdealState
            className="login-required"
            title="Login Required"
            visual="error"
            description="You must login with GitHub to use Nebula."
          />
          <Button
            iconName="user"
            className={Classes.LARGE}
            onClick={() => {
              let provider = new firebase.auth.GithubAuthProvider();
              provider.addScope('repo user read:public_key');
              provider.setCustomParameters({
                'allow_signup': 'false',
              });
              firebase.auth().signInWithPopup(provider).then(
                () => this.setState({hasUser: true}),
              );
            }}
          >
            Login
          </Button>
        </div>
      );
    }
    return <AsyncMain />;
  }
}

ReactDOM.render(
  <App/>,
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();
