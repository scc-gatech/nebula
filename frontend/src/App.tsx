import * as React from 'react';
import './App.css';
import {
  BrowserRouter as Router,
  Route,
} from 'react-router-dom';
import {
  Button,
  Menu,
  MenuItem,
  MenuDivider,
  Popover,
  Position, Tab2, Tabs2, NonIdealState, Classes, Spinner,
} from '@blueprintjs/core';
import { object } from 'prop-types';
import Lodable from 'react-loadable';
import { Navbar } from './components/Navbar';
import { Redirect, RouteComponentProps, RouterChildContext } from 'react-router';
import { PageLoadingComponent } from './components/PageLoadingComponent';
import { ConvergeModal } from './components/ConvergeModal';
import { observer } from 'mobx-react';
import * as firebase from 'firebase';

const menu = (
  <Menu>
    <MenuItem text="New"/>
    <MenuItem text="Open"/>
    <MenuItem text="Save"/>
    <MenuDivider/>
    <MenuItem text="Settings..."/>
  </Menu>
);

const TheComponent = () => (
  <div>
    <p className="App-intro">
      To get started, edit <code>src/App.tsx</code> and save to reload.
    </p>
    <Popover content={menu} position={Position.BOTTOM_RIGHT}>
      <Button text="Actions"/>
    </Popover>
  </div>
);

const AsyncHosts = Lodable({
  loader: () => import('./pages/Hosts'),
  loading: PageLoadingComponent,
});

interface SelectedTab {
  selected: string;
}

class TabsDispatch extends React.Component<SelectedTab, {}> {
  static contextTypes = {
    router: object,
  };

  context: RouterChildContext<{}>;

  render() {
    return (
      <Tabs2
        id="tab-selection-panel"
        vertical={true}
        renderActiveTabPanelOnly={true}
        selectedTabId={this.props.selected}
        onChange={
          (activeTabId: string) =>
            this.context.router.history.push(`/${activeTabId}`)
        }
      >
        <Tab2 id="hosts" title="Hosts" panel={<AsyncHosts/>}/>
        <Tab2 id="roles" title="Roles" panel={<TheComponent/>}/>
        <Tab2 id="jobs" title="Jobs" panel={<TheComponent/>}/>
        <Tab2 id="oneoffs" title="One-offs" panel={<TheComponent/>}/>
        <Tabs2.Expander/>
      </Tabs2>
    );
  }
}

@observer
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
    return (
      <Router>
        <div className="App">
          <Navbar
            title="Nebula"
            leftComponent={<input className="pt-input" placeholder="Search..." type="text"/>}
          >
            <button className="pt-button pt-minimal pt-icon-home">Home</button>
            <span className="pt-navbar-divider"/>
            <button className="pt-button pt-minimal pt-icon-user"/>
            <button className="pt-button pt-minimal pt-icon-notifications"/>
            <button className="pt-button pt-minimal pt-icon-cog"/>
          </Navbar>
          <Redirect from="/" to="/hosts"/>
          <Route
            path="/:tabId"
            render={
              (props: RouteComponentProps<{ tabId: string }>) =>
                <TabsDispatch
                  selected={props.match.params.tabId}
                />}
          />
          <div>
            <ConvergeModal/>
          </div>
        </div>
      </Router>
    );
  }
}

export default App;
