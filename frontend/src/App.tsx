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
  Position, Tab2, Tabs2,
} from '@blueprintjs/core';
import { object } from 'prop-types';
import Lodable from 'react-loadable';
import { Navbar } from './components/Navbar';
import { Redirect, RouteComponentProps, RouterChildContext } from 'react-router';
import { PageLoadingComponent } from './components/PageLoadingComponent';
import { ConvergeModal } from './components/ConvergeModal';
import { observer } from 'mobx-react';

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
class App extends React.Component<{}, {}> {
  render() {
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
            <ConvergeModal />
          </div>
        </div>
      </Router>
    );
  }
}

export default App;
