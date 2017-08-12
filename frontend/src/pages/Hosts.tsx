import * as React from 'react';
import { HostsList } from '../components/HostsList';
import { Route, RouteComponentProps, Switch as RouteSwitch } from 'react-router';
import { HostDetail } from '../components/HostDetail';

export class Hosts extends React.Component<{}, {}> {
  render() {
    return (
      <RouteSwitch>
        <Route
          exact={true}
          path="/hosts"
          render={() => <HostsList/>}
        />
        <Route
          path="/hosts/:hostName"
          render={
            (props: RouteComponentProps<{ hostName: string }>) =>
              <HostDetail
                hostname={props.match.params.hostName}
              />}
        />
      </RouteSwitch>
    );
  }
}

export default Hosts;