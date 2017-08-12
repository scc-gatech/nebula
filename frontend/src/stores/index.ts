import { observable } from 'mobx';
import { HostInfo } from '../models/Host';

class ConvergeModalState {
  @observable open = false;
  @observable targetHost: HostInfo;
  @observable targetBranch?: string;
}

class AppState {
  @observable convergeModal = new ConvergeModalState();
}

export const appState = new AppState();

export default appState;
