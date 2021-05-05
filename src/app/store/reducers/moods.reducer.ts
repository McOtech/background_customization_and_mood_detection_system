import { MoodsInterface } from "src/app/interfaces/expression.interface";
import { ACTION_STORE_MOODS, ACTION_UPDATE_MOODS, ACTION_DESTROY_MOODS } from "../actions/index.actions";

const initialMoodsState: MoodsInterface = {};

export function moodsReducer(state: MoodsInterface = initialMoodsState, action: any): MoodsInterface {
  switch (action.type) {
    case ACTION_STORE_MOODS:
      state = action.moods;
      return state;
    case ACTION_UPDATE_MOODS:
      state = action.moods;
      return state;
    case ACTION_DESTROY_MOODS:
      return initialMoodsState;
    default:
      break;
  }
  return state;
}
