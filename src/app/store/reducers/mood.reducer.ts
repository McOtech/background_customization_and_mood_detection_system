import { FacialExpressionInterface } from "src/app/interfaces/expression.interface";
import { ACTION_DESTROY_MOOD, ACTION_STORE_MOOD, ACTION_UPDATE_MOOD } from "../actions/index.actions";

const initialMoodState: FacialExpressionInterface = {
  emoji: '',
  expression: '',
  index: '',
};

export function moodReducer(state: FacialExpressionInterface = initialMoodState, action: any): FacialExpressionInterface {
  switch (action.type) {
    case ACTION_STORE_MOOD:
      state = action.mood;
      return state;
    case ACTION_UPDATE_MOOD:
      state = action.mood;
      return state;
    case ACTION_DESTROY_MOOD:
      return initialMoodState;
    default:
      break;
  }
  return state;
}
