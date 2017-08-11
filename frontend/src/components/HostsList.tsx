import * as React from 'react';
import { HostInfo } from '../models/Host';
import * as moment from 'moment';
import { Button } from '@blueprintjs/core';
import { RouterChildContext } from 'react-router';

import * as firebase from 'firebase/app';
import DataSnapshot = firebase.database.DataSnapshot;
import Reference = firebase.database.Reference;

interface HostsListProps {
  hosts: Array<HostInfo>;
}

export class HostsList extends React.Component<{}, HostsListProps> {

  static contextTypes = {
    router: React.PropTypes.object
  };
  ref: Reference;
  context: RouterChildContext<{}>;

  constructor(props: {}) {
    super(props);
    this.state = {hosts: []};
  }

  componentWillMount() {
    this.ref = firebase.database().ref('hosts');
    this.ref.on('value', (snap: DataSnapshot) => {
      this.setState({hosts: snap.val()});
    });
  }

  componentWillUnmount() {
    this.ref.off('value');
  }

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
          <th>Converge</th>
          <th>Detail</th>
        </tr>
        </thead>
        <tbody>
        {
          this.state.hosts.map((host: HostInfo, i: number) => (
            <tr
              key={i}
              onClick={() => this.context.router.history.push(`/hosts/${host.hostname}`)}
            >
              <td>{host.hostname}</td>
              <td>{host.role}</td>
              <td>{host.chefBranch}</td>
              <td>{host.chefSha ? host.chefSha.slice(0, 6) : 'uninitialized'}</td>
              <td>{moment(host.lastConverged).format('MMMM Do YYYY, h:mm:ss a')}</td>
              <td><Button iconName="git-merge"/></td>
              <td><Button iconName="list-detail-view"/></td>
            </tr>
          ))
        }
        </tbody>
      </table>
    );
  }
}

export default HostsList;
