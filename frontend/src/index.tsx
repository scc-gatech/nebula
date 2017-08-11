import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import * as firebase from 'firebase';
import './index.css';

const config = {
  apiKey: 'AIzaSyAllrgyA84f4uqeN23GiXukrwP7B6w37dU',
  authDomain: 'sc17-gatech-optica.firebaseapp.com',
  databaseURL: 'https://sc17-gatech-optica.firebaseio.com',
  projectId: 'sc17-gatech-optica',
  storageBucket: 'sc17-gatech-optica.appspot.com',
  messagingSenderId: '772306227863'
};
firebase.initializeApp(config);

ReactDOM.render(
  <App/>,
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();
