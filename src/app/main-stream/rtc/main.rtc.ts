import { LiveMediaStreamParams, NetworkConfigurationMessage } from '../interfaces/live_stream.interfaces';

const NET_CONFIG_MSG = 'network-configuration';
const REM_CONFIG_MSG = 'remote-configuration';

export class LiveMediaStream {
  socket!: any;
  selfStream!: MediaStream;
  remoteVideo!: HTMLVideoElement;
  peerConnection!: RTCPeerConnection;
  configuration = undefined;
  roomId!: string;

  constructor({selfStreamCanvasId, remoteStreamVideoId, socket}: LiveMediaStreamParams) {
    this.socket = socket;
    // this.socket = io(SOCKET_ENDPOINT);
    this.mediaStream();
    // this.selfStream = ((document.querySelector(`#${selfStreamCanvasId}`) as any).captureStream() as MediaStream);
    this.remoteVideo = (document.querySelector(`#${remoteStreamVideoId}`) as HTMLVideoElement);
    this.peerConnection = new RTCPeerConnection(this.configuration);

    //send any ice candidates to the other peer
    this.peerConnection.onicecandidate = ({ candidate }) => {
      this.socket.emit(NET_CONFIG_MSG, { roomId: this.roomId, candidate} as NetworkConfigurationMessage);
    };

    //the negotiation event trigger offer generation
    this.peerConnection.onnegotiationneeded = async () => {
      try {
        await this.peerConnection.setLocalDescription(
          await this.peerConnection.createOffer()
        );

        this.socket.emit(NET_CONFIG_MSG, { roomId: this.roomId, description: this.peerConnection.localDescription } as NetworkConfigurationMessage);
      } catch (error) {
        console.error(error);
      }
    };

    //onces remote track media arrives, show it in remote video element
    this.peerConnection.ontrack = (event: any) => {
      //don't set srcObject again if it is already set
      if (this.remoteVideo.srcObject) return;
      this.remoteVideo.srcObject = event.streams[0];
    };

    this.socket.on(REM_CONFIG_MSG, (message: NetworkConfigurationMessage) => {
      this.handleRemoteEvents(message);
    });
  }

  async start(roomId: string) {
    this.roomId = roomId;
    try {
      //get local stream, show it in self-view and add it to be sent
      this.selfStream.getTracks().forEach((track) => {
        this.peerConnection.addTrack(track);
      });
    } catch (error) {
      console.error(error);
    }
  }

  mediaStream() {
    navigator.mediaDevices.getUserMedia({audio: true, video: true})
    .then((stream: MediaStream) => {
      this.selfStream = stream;
    })
    .catch(error => {
      console.log(error);
    });
  }

  async handleRemoteEvents({candidate, description}: NetworkConfigurationMessage) {
    try {
      //if we get an offer, we need to reply with an answer
      if (description) {
        switch (description.type) {
          case 'offer':
            await this.peerConnection.setRemoteDescription(description);
            this.selfStream.getTracks().forEach((track) => {
              this.peerConnection.addTrack(track);
            });

            await this.peerConnection.setLocalDescription(
              await this.peerConnection.createAnswer()
            );

            this.socket.emit(NET_CONFIG_MSG, { roomId: this.roomId, description: this.peerConnection.localDescription} as NetworkConfigurationMessage);
            break;
          case 'answer':
            await this.peerConnection.setLocalDescription(description);
            break;
          default:
            break;
        }
      } else if (candidate) {
        await this.peerConnection.addIceCandidate(candidate);
      }
    } catch (error) {
      console.error(error);
    }
  }
}
