import * as React from 'react';

export class HostView extends React.Component<{hostname: string}, {}> {
  render() {
    return <p>{this.props.hostname}</p>;
  }
}
