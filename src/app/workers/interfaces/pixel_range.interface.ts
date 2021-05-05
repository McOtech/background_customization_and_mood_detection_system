import { PrimaryColorDensityInterface } from './color_density.interface';

export interface PixelRangeInterface {
  mode: any;
  least: any;
}

export interface OptimumPixelRangeInterface {
  r?: PrimaryColorDensityInterface;
  g?: PrimaryColorDensityInterface;
  b?: PrimaryColorDensityInterface;
}
