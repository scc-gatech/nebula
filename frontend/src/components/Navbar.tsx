import * as React from 'react';
import { Component } from 'react';

interface Props {
  title: string;
  leftComponent?: JSX.Element;
  children?: Array<JSX.Element> | JSX.Element;
}

export class Navbar extends Component<Props, {}> {
  render() {
    return (
      <nav className="pt-navbar .pt-dark">
        <div className="pt-navbar-group pt-align-left">
          <div className="pt-navbar-heading">{this.props.title}</div>
          {this.props.leftComponent}
        </div>
        <div className="pt-navbar-group pt-align-right">
          {this.props.children}
        </div>
      </nav>
    );
  }
}

export default Navbar;