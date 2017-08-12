import * as React from 'react';
import { HostInfo } from '../models/Host';

import * as firebase from 'firebase';
import DataSnapshot = firebase.database.DataSnapshot;
import Reference = firebase.database.Reference;
import { Spinner } from '@blueprintjs/core';
import { HostTable } from './HostsList';

export class HostView extends React.Component<{ host: HostInfo }, {}> {
  render() {
    return (
      <div className="host-detail">
        <h2>{this.props.host.hostname}</h2>
        <HostTable hosts={[this.props.host]}/>
      </div>
    );
  }
}

interface HostDetailState {
  host?: HostInfo;
}

export class HostDetail extends React.Component<{ hostname: string }, HostDetailState> {

  ref: Reference;

  constructor(props: { hostname: string }) {
    super(props);
    this.state = {};
  }

  componentWillMount() {
    this.ref = firebase.database().ref(`hosts/${this.props.hostname.replace(/\./g, ',')}`);
    this.ref.on('value', (snap: DataSnapshot) => {
      this.setState({host: snap.val()});
    });
  }

  componentWillUnmount() {
    this.ref.off('value');
  }

  render() {
    if (!this.state.host) {
      return <Spinner/>;
    }
    return (
      <HostView host={this.state.host}/>
    );
  }
}
