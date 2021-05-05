export interface VideoTrackEditorInputInterface {
  mainFrame: ImageData;
  customBgFrame: ImageData;
  modeRange: MainColorRangeInterface;
  leastRange: MainColorRangeInterface;
  colorKeys: string[];
  isMonochrome: boolean;
  toggleGreenScreen: boolean;
}

export interface MainColorRangeInterface {
  min: number;
  max: number;
}
