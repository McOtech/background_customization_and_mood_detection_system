/// <reference lib="webworker" />

import { ColorInterface } from "./workers/interfaces/color.interface";
import { PrimaryColorDensityInterface } from "./workers/interfaces/color_density.interface";
import { MinMaxColorInterface } from "./workers/interfaces/min_max_color.interface";
import { OptimumPixelRangeInterface, PixelRangeInterface } from "./workers/interfaces/pixel_range.interface";

addEventListener('message', ({ data }: any) => {
  const frame: ImageData = data.message;
  ColorRange.findPixelRange(frame)
  .then((optimumColors: OptimumPixelRangeInterface) => {
    postMessage({message: optimumColors});
  })
  .catch(error => {
    console.error(new Error(error));
  });
});


class ColorRange {
  static minPrimaryColor(val: MinMaxColorInterface, a: ColorInterface, b: ColorInterface): MinMaxColorInterface {
    if (a.value < b.value) {
      val.least = {
        value: a.value,
        color: a.color
      };
      return val;
    }
    val.least = {
      value: b.value,
      color: b.color
    };
    return val;
  }

  static maxPrimaryColor(r: number, g: number, b: number): MinMaxColorInterface {
    const val: MinMaxColorInterface = ({} as MinMaxColorInterface);
    if (r >= g && r >= b) {
      val.mode = {
        value: r,
        color: 'r'
      };
      return ColorRange.minPrimaryColor(val, {value: g, color: 'g'}, {value: b, color: 'b'});
    }
    if (g >= r && g >= b) {
      val.mode = {
        value: g,
        color: 'g'
      };
      return ColorRange.minPrimaryColor(val, {value: r, color: 'r'}, {value: b, color: 'b'});
    }
    val.mode = {
      value: b,
      color: 'b'
    };
    return ColorRange.minPrimaryColor(val, {value: r, color: 'r'}, {value: g, color: 'g'});
  }

  static findPixelRange(frame: ImageData): Promise<OptimumPixelRangeInterface> {
    return (new Promise((resolve, reject) => {
      try {
        const colorRange: PixelRangeInterface = ({} as PixelRangeInterface);
        const frameLength: number = (frame.data.length / 4);
        frame.data.some((pixel: number, i: number): boolean => {
          if (i >= frameLength) {
            return true;
          }
          try {
            const r: number = frame.data[i * 4 + 0];
            const g: number = frame.data[i * 4 + 1];
            const b: number = frame.data[i * 4 + 2];
            const pixelRange = ColorRange.maxPrimaryColor(r, g, b);

            if (colorRange.mode !== undefined && colorRange.mode[pixelRange.mode.color] !== undefined) {
              colorRange.mode[pixelRange.mode.color].count = colorRange.mode[pixelRange.mode.color].count + 1;
              colorRange.mode[pixelRange.mode.color].min = Math.min(pixelRange.mode.value, colorRange.mode[pixelRange.mode.color].min);
              colorRange.mode[pixelRange.mode.color].max = Math.max(pixelRange.mode.value, colorRange.mode[pixelRange.mode.color].max);
            } else {
              colorRange.mode = {};
              colorRange.mode[pixelRange.mode.color] = ({
                count: 1,
                min: pixelRange.mode.value,
                max: pixelRange.mode.value
              } as PrimaryColorDensityInterface);
            }

            if (colorRange.least !== undefined && colorRange.least[pixelRange.least.color] !== undefined) {
              colorRange.least[pixelRange.least.color].count = colorRange.least[pixelRange.least.color].count + 1;
              colorRange.least[pixelRange.least.color].min = Math.min(pixelRange.least.value, colorRange.least[pixelRange.least.color].min);
              colorRange.least[pixelRange.least.color].max = Math.max(pixelRange.least.value, colorRange.least[pixelRange.least.color].max);
            } else {
              colorRange.least = {};
              colorRange.least[pixelRange.least.color] = ({
                count: 1,
                min: pixelRange.least.value,
                max: pixelRange.least.value
              } as PrimaryColorDensityInterface);
            }
          } catch (error) {
            //
          }
          return false;
        });
        resolve(({...colorRange.mode, ...colorRange.least} as OptimumPixelRangeInterface));
      } catch (error) {
        reject(error);
      }
    }));
  }
}
