import { observable } from 'mobx';
import { HostInfo } from '../models/Host';

class ConvergeModalState {
  @observable open = false;
  @observable targetHost: HostInfo;
  @observable targetBranch?: string;
}

class AuthState {
  @observable authStateFetched: boolean = false;
  @observable authenticated: boolean = false;
  @observable authToken?: string;
}

class AppState {

  @observable auth = new AuthState();
  @observable convergeModal = new ConvergeModalState();
}

export const appState = new AppState();

export default appState;
