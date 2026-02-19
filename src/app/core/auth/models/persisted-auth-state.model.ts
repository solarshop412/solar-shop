import { User } from '../../../shared/models/user.model';

export interface PersistedAuthState {
  token: string;
  user: User;
  loggedIn: boolean;
  timestamp: number;
}
