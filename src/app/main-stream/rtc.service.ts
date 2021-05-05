import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as io from 'socket.io-client';
import { FacialExpressionInterface, MoodsInterface } from '../interfaces/expression.interface';
import { ACTION_STORE_MOODS, ACTION_STORE_PEER } from '../store/actions/index.actions';
import { SOCKET_ENDPOINT } from './constants/index.constant';
import { NetworkConfigurationMessage } from './interfaces/live_stream.interfaces';

const NET_CONFIG_MSG = 'network-configuration';
const REM_CONFIG_MSG = 'remote-configuration';

@Injectable({
  providedIn: 'root'
})
export class RtcService {
  socket!: any;
  selfStream!: MediaStream;
  remoteVideo!: HTMLVideoElement;
  peerConnection!: RTCPeerConnection;
  configuration = undefined;
  roomId!: string;
  clientId: string = 'self';

  constructor(private store: Store) {
    this.socket = io(SOCKET_ENDPOINT);
  }

  initRTC(): void {
    this.store.select<FacialExpressionInterface>((reducer: any): FacialExpressionInterface => reducer.moodReducer).subscribe((storedMood: FacialExpressionInterface) => {
      if (storedMood?.expression.length > 0) {
        this.emit('mood', { roomId: this.roomId, mood: storedMood });
      }
    });

    this.listen('remote-mood').subscribe((data: MoodsInterface) => {
      this.store.dispatch({type: ACTION_STORE_MOODS, moods: data });
    });

    this.mediaStream();
    // const remoteStreamVideoId = 'remote_stream';
    // this.remoteVideo = (document.querySelector(`#${remoteStreamVideoId}`) as HTMLVideoElement);
    this.peerConnection = new RTCPeerConnection(this.configuration);

    //send any ice candidates to the other peer
    this.peerConnection.onicecandidate = ({ candidate }) => {
      this.emit(NET_CONFIG_MSG, { roomId: this.roomId, candidate} as NetworkConfigurationMessage);
    };

    //the negotiation event trigger offer generation
    this.peerConnection.onnegotiationneeded = async () => {
      try {
        await this.peerConnection.setLocalDescription(
          await this.peerConnection.createOffer()
        );

        this.emit(NET_CONFIG_MSG, { roomId: this.roomId, description: this.peerConnection.localDescription } as NetworkConfigurationMessage);
      } catch (error) {
        console.error(error);
      }
    };

    //onces remote track media arrives, show it in remote video element
    this.peerConnection.ontrack = (event: any) => {
      //don't set srcObject again if it is already set
      this.store.dispatch({type: ACTION_STORE_PEER, id: this.clientId, stream: event.streams[0] });
      // if (!this.remoteVideo?.srcObject) {
      //   this.remoteVideo.srcObject = event.streams[0];
      // }
    };

    this.listen(REM_CONFIG_MSG).subscribe((data: NetworkConfigurationMessage) => {
      this.handleRemoteEvents(data);
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

  private mediaStream() {
    navigator.mediaDevices.getUserMedia({audio: true, video: true})
    .then((stream: MediaStream) => {
      this.selfStream = stream;
    })
    .catch(error => {
      console.log(error);
    });
  }

  private async handleRemoteEvents({ clientId, candidate, description }: any) {
    try {
      this.clientId = clientId;
      //if we get an offer, we need to reply with an answer
      if (description) {
        switch (description.type) {
          case 'offer':
            await this.peerConnection.setRemoteDescription(description);
            // this.selfStream.getTracks().forEach((track) => {
            //   this.peerConnection.addTrack(track);
            // });

            await this.peerConnection.setLocalDescription(
              await this.peerConnection.createAnswer()
            );

            this.emit(NET_CONFIG_MSG, { roomId: this.roomId, description: this.peerConnection.localDescription} as NetworkConfigurationMessage);
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

  listen(eventName: string): Observable<any> {
    return new Observable((subscriber) => {
      this.socket.on(eventName, (data: any) => {
        subscriber.next(data);
      });
    });
  }

  emit(eventName: string, data: any): void {
    this.socket.emit(eventName, data);
  }
}
