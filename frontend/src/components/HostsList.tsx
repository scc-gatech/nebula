import * as React from 'react';
import { HostInfo } from '../models/Host';
import * as moment from 'moment';
import { Button, Spinner } from '@blueprintjs/core';
import { RouterChildContext } from 'react-router';
import { object } from 'prop-types';

import * as firebase from 'firebase/app';
import DataSnapshot = firebase.database.DataSnapshot;
import Reference = firebase.database.Reference;
import { appState } from '../stores/index';
import { runInAction } from 'mobx';

class HostRow extends React.PureComponent<{ host: HostInfo }, {}> {
  static contextTypes = {
    router: object,
  };
  context: RouterChildContext<{}>;

  viewHostDetail = (event: React.MouseEvent<HTMLElement>) => {
    this.context.router.history.push(`/hosts/${this.props.host.hostname}`);
    event.stopPropagation();
  }

  convergeHost = (event: React.MouseEvent<HTMLElement>) => {
    runInAction('set target host and open modal', () => {
      appState.convergeModal.targetBranch = this.props.host.chefBranch;
      appState.convergeModal.targetHost = this.props.host;
      appState.convergeModal.open = true;
    });
    event.stopPropagation();
  }

  render() {
    let host = this.props.host;
    return (
      <tr
        onClick={this.viewHostDetail}
      >
        <td>{host.hostname}</td>
        <td>{host.chefRole}</td>
        <td>{host.chefBranch}</td>
        <td>{host.chefSha ? host.chefSha.slice(0, 6) : 'uninitialized'}</td>
        <td>{host.lastConverged ? moment(host.lastConverged).format('MMMM Do YYYY, h:mm:ss a') : 'uninitialized'}</td>
        <td>{host.chefStatus}</td>
        <td className="converge-col"><Button iconName="git-merge" onClick={this.convergeHost}/></td>
      </tr>
    );
  }
}

export class HostTable extends React.Component<{ hosts: Array<HostInfo> }, {}> {
  render() {
    return (
      <table className="pt-table pt-striped pt-interactive">
        <thead>
        <tr>
          <th>Host Name</th>
          <th>Role</th>
          <th>Chef Branch</th>
          <th>Chef SHA</th>
          <th>Last Converged</th>
          <th>Status</th>
          <th>Converge</th>
        </tr>
        </thead>
        <tbody>
        {this.props.hosts.map((host: HostInfo, i: number) => <HostRow key={i} host={host}/>)}
        </tbody>
      </table>
    );
  }
}

export class HostsList extends React.Component<{}, { hosts: Array<HostInfo> }> {
  ref: Reference;

  constructor(props: {}) {
    super(props);
    this.state = {hosts: []};
  }

  componentWillMount() {
    this.ref = firebase.database().ref('hosts');
    this.ref.on('value', (snap: DataSnapshot) => {
      this.setState({
        hosts: Object.values(snap.val()),
      });
    });
  }

  componentWillUnmount() {
    this.ref.off('value');
  }

  render() {
    if (this.state.hosts.length === 0) {
      return <Spinner/>;
    }
    return <HostTable hosts={this.state.hosts}/>;
  }
}

export default HostsList;
