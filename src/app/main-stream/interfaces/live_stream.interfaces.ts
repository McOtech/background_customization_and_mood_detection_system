export interface StreamContainer {
  localStream: number;
}

export interface NetworkConfigurationMessage {
  roomId: string;
  candidate?: RTCIceCandidate;
  description?: RTCSessionDescription;
}

export interface LiveMediaStreamParams {
  selfStreamCanvasId: string;
  remoteStreamVideoId: string;
  socket: any;
}
