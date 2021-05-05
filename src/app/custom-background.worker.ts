/// <reference lib="webworker" />

import { PixelInterface } from "./workers/interfaces/rgb_pixel.interface";
import { VideoTrackEditorInputInterface } from "./workers/interfaces/video_track_editor_input.interface";

addEventListener('message', ({ data }: any) => {
  const message: VideoTrackEditorInputInterface = data;
  VideoTrackEditor.customize(message)
  .then((frame: ImageData) => {
    postMessage({frame});
  })
  .catch(error => {
    console.error(new Error(error));
  });
});

class VideoTrackEditor {
  static customize({
    mainFrame,
    customBgFrame,
    modeRange,
    leastRange,
    colorKeys,
    isMonochrome,
    toggleGreenScreen
  }: VideoTrackEditorInputInterface): Promise<ImageData> {
    return (new Promise((resolve, reject) => {
      try {
        const mainFrameLength = (mainFrame.data.length / 4);
        if (toggleGreenScreen === true) {
          mainFrame.data.some((px: number, i: number): boolean => {
            if (i >= mainFrameLength) {
              return true;
            }
            const pixel: any = ({
              r: mainFrame.data[i * 4 + 0],
              g: mainFrame.data[i * 4 + 1],
              b: mainFrame.data[i * 4 + 2]
            } as PixelInterface);
            try {
              if (
                pixel[colorKeys[0]] >= modeRange.min &&
                pixel[colorKeys[0]] <= modeRange.max &&
                pixel[colorKeys[1]] >= leastRange.min &&
                pixel[colorKeys[1]] <= leastRange.max
              ) {
                mainFrame.data[i * 4 + 0] = customBgFrame.data[i * 4 + 0];
                mainFrame.data[i * 4 + 1] = customBgFrame.data[i * 4 + 1];
                mainFrame.data[i * 4 + 2] = customBgFrame.data[i * 4 + 2];
                mainFrame.data[i * 4 + 3] = customBgFrame.data[i * 4 + 3];
              } else if (isMonochrome === true) {
                const average: number = (mainFrame.data[i * 4 + 0] + mainFrame.data[i * 4 + 1] + mainFrame.data[i * 4 + 2]) / 3;
                mainFrame.data[i * 4 + 0] = average;
                mainFrame.data[i * 4 + 1] = average;
                mainFrame.data[i * 4 + 2] = average;
              }
            } catch (error) {
              //
            }
            return false;
          });
        }

        if (isMonochrome === true) {
          mainFrame.data.some((px: number, i: number): boolean => {
            if (i >= mainFrameLength) {
              return true;
            }
            try {
              const average: number = (
                mainFrame.data[i * 4 + 0] +
                mainFrame.data[i * 4 + 1] +
                mainFrame.data[i * 4 + 2]
                ) / 3;
              mainFrame.data[i * 4 + 0] = average;
              mainFrame.data[i * 4 + 1] = average;
              mainFrame.data[i * 4 + 2] = average;
            } catch (error) {
              //
            }
            return false;
          });
        }
        resolve(mainFrame);
      } catch (error) {
        reject(error);
      }
    }));
  }
}
