import * as React from 'react';
import { HostsList } from '../components/HostsList';
import { Route, RouteComponentProps, Switch } from 'react-router';
import { HostView } from '../components/HostView';

export class Hosts extends React.Component<{}, {}> {
  render() {
    return (
      <Switch>
        <Route
          exact={true}
          path="/hosts"
          render={() => <HostsList/>}
        />
        <Route
          path="/hosts/:hostName"
          render={
            (props: RouteComponentProps<{ hostName: string }>) =>
              <HostView
                hostname={props.match.params.hostName}
              />}
        />
      </Switch>
    );
  }
}
