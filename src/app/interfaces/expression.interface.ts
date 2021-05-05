export interface FacialExpressionInterface {
  emoji: string;
  expression: string;
  index: string;
}

export interface MoodsInterface {
  neutral?: FacialExpressionInterface;
  happy?: FacialExpressionInterface;
  sad?: FacialExpressionInterface;
  surprised?: FacialExpressionInterface;
  angry?: FacialExpressionInterface;
}
