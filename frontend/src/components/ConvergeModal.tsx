import * as React from 'react';
import { Button, Classes, Intent, MenuItem, Overlay } from '@blueprintjs/core';
import { ISelectItemRendererProps, Select } from '@blueprintjs/labs';
import { appState } from '../stores/index';
import { observer } from 'mobx-react';
import * as classNames from 'classnames';
import { SyntheticEvent } from 'react';

const BranchSelect = Select.ofType<string>();

@observer
export class ConvergeModal extends React.Component<{}, {}> {
  constructor(props: {}) {
    super(props);
  }

  indicateWillNotChangeBranch = (branchName: string) => {
    return appState.convergeModal.targetHost.chefBranch === branchName ?
      `${branchName} (won't change branch)` : branchName;
  }

  closeModal = () => appState.convergeModal.open = false;

  render() {
    const overlayClasses = classNames(
      Classes.CARD,
      Classes.ELEVATION_4,
      'overlay-common',
      'docs-overlay-example-transition'
    );
    const targetHost = appState.convergeModal.targetHost;
    if (!targetHost) {
      return null;
    }
    return (
      <Overlay
        className={Classes.OVERLAY_SCROLL_CONTAINER}
        isOpen={appState.convergeModal.open}
        onClose={this.closeModal}
        canOutsideClickClose={true}
        canEscapeKeyClose={true}
      >
        <div className={overlayClasses}>
          <h2>Converge <code>{targetHost.hostname}</code></h2>
          <br/>
          <h4>Change Branch</h4>
          <BranchSelect
            popoverProps={{portalClassName: 'branch-popup popup'}}
            items={['master', 'next', 'intel', 'linpack']}
            noResults={<MenuItem disabled={true} text="No results. Ask in #nebula."/>}
            itemRenderer={
              (props: ISelectItemRendererProps<string>) =>
                <MenuItem
                  text={this.indicateWillNotChangeBranch(props.item)}
                  key={props.index}
                  onClick={props.handleClick}
                />
            }
            onItemSelect={
              (item: string, event?: SyntheticEvent<HTMLElement>) =>
                appState.convergeModal.targetBranch = item
            }
            itemPredicate={(query: string, item: string, index: number) => item.indexOf(query) !== -1}
          >
            <Button
              text={this.indicateWillNotChangeBranch(appState.convergeModal.targetBranch!)}
              rightIconName="double-caret-vertical"
            />
          </BranchSelect>
          <div className="popover-actions">
            <Button
              text="Close"
              className="close-button"
              intent={Intent.DANGER}
              onClick={this.closeModal}
            />
            <Button
              text="Confirm"
              className="confirm-button"
              intent={Intent.PRIMARY}
              onClick={this.closeModal}
            />
          </div>
        </div>
      </Overlay>
    );
  }
}

export default ConvergeModal;
