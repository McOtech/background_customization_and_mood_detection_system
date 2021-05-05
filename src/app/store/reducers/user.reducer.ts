import { User } from 'src/app/interfaces/user.interface';
import { ACTION_LOGIN, ACTION_LOGOUT } from '../actions/index.actions';

const initialAuthState: User = {
  status: false,
  username: ''
};

export function userReducer(state: User = initialAuthState, action: any ): User {
  switch (action.type) {
    case ACTION_LOGIN:
      return {
        ...state,
        status: action.status,
        username: action.username,
        _id: action._id,
        updated_at: action.updated_at,
        created_at: action.created_at,
      };
    case ACTION_LOGOUT:
      return {
        status: false,
        username: '',
      };
    default:
      break;
  }
  return state;
}
