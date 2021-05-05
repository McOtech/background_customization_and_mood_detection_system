import { Room } from 'src/app/interfaces/room.interface';
import { ACTION_DESTROY_ROOM, ACTION_STORE_ROOM, ACTION_STORE_ROOMS, ACTION_UPDATE_ROOM } from '../actions/index.actions';

const initialRoomState: Room[] = [];

export function roomReducer(state: Room[] = initialRoomState, action: any): Room[] {
  switch (action.type) {
    case ACTION_STORE_ROOM:
      const newRoom: Room[] = [
        {
          _id: action._id,
          profileId: action.profileId,
          title: action.title,
          dueDate: action.dueDate,
          updated_at: action.updated_at,
          created_at: action.created_at
        }
      ];
      return [...state, ...newRoom];
    case ACTION_STORE_ROOMS:
      const listOfRooms: Room[] = action.rooms;
      return listOfRooms;
    case ACTION_UPDATE_ROOM:
      const newState: Room[] = state.map((room: Room) => {
        if (room._id === action._id) {
          const updatedRoom: Room = {
            _id: room._id,
            profileId: room.profileId,
            title: action.title,
            dueDate: action.dueDate,
            updated_at: action.updated_at,
            created_at: room.created_at
          };
          return updatedRoom;
        }
        return room;
      });
      return newState;
    case ACTION_DESTROY_ROOM:
      let updatedState: Room[] = state.map((room: Room) => {
        if (room._id !== action._id) {
          return room;
        }
        return {...room, _id: undefined};
      });
      const rooms: Room[] = [];
      updatedState.forEach((room: Room) => {
        if (room._id !== undefined) {
          rooms.push(room);
        }
      });
      updatedState = [];
      return rooms;
    default:
      break;
  }
  return state;
}
