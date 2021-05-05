import { Peer } from "src/app/interfaces/peer.interface";
import { ACTION_STORE_PEER, ACTION_UPDATE_PEER, ACTION_DESTROY_PEER } from "../actions/index.actions";

const initialPeerState: Peer[] = [];

export function peerReducer(state: Peer[] = initialPeerState, action: any): Peer[] {
  switch (action.type) {
    case ACTION_STORE_PEER:
      try {
        state.push({id: action.id, stream: action.stream} as Peer);
      } catch (error) {

      }

      return state;
    case ACTION_UPDATE_PEER:
      state.push({id: action.id, stream: action.stream} as Peer);
      return state;
    case ACTION_DESTROY_PEER:
      return state.filter((peer: Peer) => peer.id !== action.id);
    default:
      break;
  }
  return state;
}
