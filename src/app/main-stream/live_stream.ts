export class LiveStream {
  localStream!: MediaStream;
  // remoteStream!: MediaStream;

  remoteStreamContainer!: HTMLVideoElement;

  localPeerConnection!: RTCPeerConnection;
  remotePeerConnection!: RTCPeerConnection;

  // Set up to exchange only video.
  offerOptions!: RTCOfferOptions;

  // Define initial start time of the call (defined as connection between peers).
  startTime = null;

  constructor(stream: MediaStream, remoteVideoElementId: string) {
    this.localStream = stream;
    this.remoteStreamContainer = (document.querySelector(`#${remoteVideoElementId}`) as HTMLVideoElement);
    this.offerOptions = {
      offerToReceiveVideo: true,
      offerToReceiveAudio: true
    }
  }

  // Handles remote MediaStream success by adding it as the remoteVideo src.
  gotRemoteMediaStream(event: any): void {
    const mediaStream = new MediaStream(); //event.stream;
    mediaStream.addTrack(event.track);
    this.remoteStreamContainer.srcObject = mediaStream;
  }

  // Connects with new peer candidate.
  handleConnection(event: any): void {
    const peerConnection = event.target;
    const iceCandidate = event.candidate;

    if (iceCandidate) {
      const newIceCandidate = new RTCIceCandidate(iceCandidate);
      const otherPeer = this.getOtherPeer(peerConnection);

      otherPeer.addIceCandidate(newIceCandidate)
      .then(() => {
        this.handleConnectionSuccess(peerConnection);
      }).catch((error) => {
        this.handleConnectionFailure(peerConnection, error);
      });
    }
  }

  // Gets the "other" peer connection.
  getOtherPeer(peerConnection: RTCPeerConnection): RTCPeerConnection {
    return (peerConnection === this.localPeerConnection) ? this.remotePeerConnection : this.localPeerConnection;
  }

  // Logs offer creation and sets peer connection session descriptions.
  createdOffer(description: RTCSessionDescription) {
    this.localPeerConnection.setLocalDescription(description)
      .then(() => {
        this.setLocalDescriptionSuccess(this.localPeerConnection);
      }).catch((error: any) => {
        this.setSessionDescriptionError(error);
      });

    this.trace('remotePeerConnection setRemoteDescription start.');
    this.remotePeerConnection.setRemoteDescription(description)
      .then(() => {
        this.setRemoteDescriptionSuccess(this.remotePeerConnection);
      }).catch((error: any) => {
        this.setSessionDescriptionError(error);
      });

    this.trace('remotePeerConnection createAnswer start.');
    this.remotePeerConnection.createAnswer()
      .then((description: any) => {
        this.createdAnswer(description);
      })
      .catch((error: any) => {
        this.setSessionDescriptionError(error);
      });
  }

  // Logs answer to offer creation and sets peer connection session descriptions.
  createdAnswer(description: RTCSessionDescription) {
    this.trace(`Answer from remotePeerConnection:\n${description.sdp}.`);

    this.trace('remotePeerConnection setLocalDescription start.');
    this.remotePeerConnection.setLocalDescription(description)
      .then(() => {
        this.setLocalDescriptionSuccess(this.remotePeerConnection);
      }).catch((error: any) => {
        this.setSessionDescriptionError(error);
      });

    this.trace('localPeerConnection setRemoteDescription start.');
    this.localPeerConnection.setRemoteDescription(description)
      .then(() => {
        this.setRemoteDescriptionSuccess(this.localPeerConnection);
      }).catch((error: any) => {
        this.setSessionDescriptionError(error);
      });
  }

  // Handles call button action: creates peer connection.
  callAction() {
    const servers = undefined;  // Allows for RTC server configuration.

    // Create peer connections and add behavior.
    this.localPeerConnection = new RTCPeerConnection(servers);
    this.trace('Created local peer connection object this.localPeerConnection.');

    this.localPeerConnection.addEventListener('icecandidate', (event: any) => {
      this.handleConnection(event);
    });
    this.localPeerConnection.addEventListener(
      'iceconnectionstatechange', (event: any) => {
        this.handleConnectionChange(event);
      });

    this.remotePeerConnection = new RTCPeerConnection(servers);
    this.trace('Created remote peer connection object remotePeerConnection.');

    this.remotePeerConnection.addEventListener('icecandidate', (event: any) => {
      this.handleConnection(event);
    });

    this.remotePeerConnection.addEventListener(
      'iceconnectionstatechange', (event: any) => {
        this.handleConnectionChange(event);
      });

    // this.remotePeerConnection.addEventListener('addstream', (event: any) => {
    //   this.gotRemoteMediaStream(event);
    // });

    this.remotePeerConnection.addEventListener('track', async (event: any) => {
      this.gotRemoteMediaStream(event);
    });

    // Add local stream to connection and create offer to connect.
    this.localStream.getTracks().forEach((track) => {
      this.localPeerConnection.addTrack(track, this.localStream);
    });
    // this.localPeerConnection.addStream(this.localStream);
    this.trace('Added local stream to localPeerConnection.');

    this.trace('localPeerConnection createOffer start.');
    this.localPeerConnection.createOffer(this.offerOptions)
      .then((description: any) => {
        this.createdOffer(description);
      }).catch((error: any) => {
        this.setSessionDescriptionError(error);
      });
  }

  // Handles hangup action: ends up call, closes connections and resets peers.
  hangupAction() {
    this.localPeerConnection.close();
    this.remotePeerConnection.close();
    // this.localPeerConnection = null;
    // this.remotePeerConnection = null;
    this.trace('Ending call.');
  }



  //==================================================================================================
  // HELPER FUNCTIONS
  //==================================================================================================

  // Logs that the connection succeeded.
  handleConnectionSuccess(peerConnection: RTCPeerConnection) {
    this.trace(`${this.getPeerName(peerConnection)} addIceCandidate success.`);
  };

  // Logs that the connection failed.
  handleConnectionFailure(peerConnection: RTCPeerConnection, error: any) {
    this.trace(`${this.getPeerName(peerConnection)} failed to add ICE Candidate:\n`+
          `${error.toString()}.`);
  }

  // Logs changes to the connection state.
  handleConnectionChange(event: any): void {
    const peerConnection = event.target;
    console.log('ICE state change event: ', event);
    this.trace(`${this.getPeerName(peerConnection)} ICE state: ` +
          `${peerConnection.iceConnectionState}.`);
  }

  // Logs error when setting session description fails.
  setSessionDescriptionError(error: any): void {
    this.trace(`Failed to create session description: ${error.toString()}.`);
  }

  // Logs success when setting session description.
  setDescriptionSuccess(peerConnection: RTCPeerConnection, functionName: string): void {
    const peerName = this.getPeerName(peerConnection);
    this.trace(`${peerName} ${functionName} complete.`);
  }

  // Logs success when localDescription is set.
  setLocalDescriptionSuccess(peerConnection: RTCPeerConnection): void {
    this.setDescriptionSuccess(peerConnection, 'setLocalDescription');
  }

  // Logs success when remoteDescription is set.
  setRemoteDescriptionSuccess(peerConnection: RTCPeerConnection): void {
    this.setDescriptionSuccess(peerConnection, 'setRemoteDescription');
  }

  // Gets the name of a certain peer connection.
  getPeerName(peerConnection: RTCPeerConnection): string {
    return (peerConnection === this.localPeerConnection) ? 'localPeerConnection' : 'remotePeerConnection';
  }

  // Logs an action (text) and the time when it happened on the console.
  trace(text: string): void {
    text = text.trim();
    const now = (window.performance.now() / 1000).toFixed(3);
    console.log(now, text);
  }
}
