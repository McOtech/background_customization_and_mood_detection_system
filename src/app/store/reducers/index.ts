import { ActionReducerMap } from '@ngrx/store';
import { Profile } from 'src/app/interfaces/profile.interface';
import { Room } from 'src/app/interfaces/room.interface';
import { User } from 'src/app/interfaces/user.interface';
import { userReducer } from './user.reducer';
import { profileReducer } from './profile.reducer';
import { roomReducer } from './room.reducer';
import { Peer } from 'src/app/interfaces/peer.interface';
import { peerReducer } from './peer.reducer';
import { FacialExpressionInterface, MoodsInterface } from 'src/app/interfaces/expression.interface';
import { moodReducer } from './mood.reducer';
import { moodsReducer } from './moods.reducer';

export interface AppState {
  userReducer: User;
  roomReducer: Room[];
  profileReducer: Profile;
  peerReducer: Peer[];
  moodReducer: FacialExpressionInterface;
  moodsReducer: MoodsInterface;
}

export const reducers: ActionReducerMap<AppState> = {
  userReducer,
  roomReducer,
  profileReducer,
  peerReducer,
  moodReducer,
  moodsReducer,
};
