import { Profile } from 'src/app/interfaces/profile.interface';
import { ACTION_DESTROY_PROFILE, ACTION_STORE_PROFILE, ACTION_UPDATE_PROFILE } from '../actions/index.actions';

const initialProfileState: Profile = {
    userId: '',
    name: '',
    email: '',
    updated_at: undefined,
    created_at: undefined,
};

export function profileReducer(state: Profile = initialProfileState, action: any): Profile {
  switch (action.type) {
    case ACTION_STORE_PROFILE:
      const newProfile: Profile = {
        _id: action._id,
        userId: action.userId,
        name: action.name,
        email: action.email,
        updated_at: action.updated_at,
        created_at: action.created_at,
      };
      return {...state, ...newProfile};
    case ACTION_UPDATE_PROFILE:
      const newState: Profile = {
        _id: action._id,
        userId: action.userId,
        name: action.name,
        email: action.email,
        updated_at: action.updated_at,
        created_at: action.created_at,
      };
      return {...state, ...newState};
    case ACTION_DESTROY_PROFILE:
      const updatedState: Profile = initialProfileState;
      return {...updatedState};
    default:
      break;
  }
  return state;
}
