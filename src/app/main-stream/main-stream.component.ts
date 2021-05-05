import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { CustomBackgroundMedia } from '../interfaces/customBackgroundMedia.interface';
import { FacialExpressionInterface, MoodsInterface } from '../interfaces/expression.interface';
import { Peer } from '../interfaces/peer.interface';
import { ACTION_STORE_MOOD } from '../store/actions/index.actions';
import { OptimumPixelRangeInterface } from '../workers/interfaces/pixel_range.interface';
import { EXPRESSIONS, SATRA_EVENT_NAME, ZOOM_INDEX_EVENT_NAME } from './constants/index.constant';
import { LiveStream } from './live_stream';
import { RtcService } from './rtc.service';
declare var $: any;
declare var faceapi: any;

@Component({
  selector: 'app-main-stream',
  templateUrl: './main-stream.component.html',
  styleUrls: ['./main-stream.component.scss']
})
export class MainStreamComponent implements OnInit {
  zoomIndex = 1;
  pixelColors!: OptimumPixelRangeInterface | any;
  colorKeys!: string[];
  colorRangeWorker!: Worker;
  bgProcessorWorker!: Worker;
  c_out!: HTMLCanvasElement;
  ctx_out!: CanvasRenderingContext2D;
  alpha: number = 0;
  inc_range: number = 0;
  dec_range: number = 0;
  black_and_white: boolean = false;
  customBgImage!: HTMLImageElement;
  customBgVideo!: HTMLVideoElement;
  c_in!: HTMLCanvasElement;
  ctx_tmp!: CanvasRenderingContext2D;
  c_tmp!: HTMLCanvasElement;
  ctx1_tmp!: CanvasRenderingContext2D;
  toggleGreenScreen: boolean = true;

  mood!: FacialExpressionInterface;
  peers: Peer[] = [];
  meetingMood: FacialExpressionInterface[] = [];

  // localStreamContainer: any;
  // liveStream!: LiveStream;

  constructor(private store: Store) { }

  ngOnInit(): void {
    try {
      const remoteVideo = (document.querySelector(`#remote_stream`) as HTMLVideoElement);
      this.store.select<Peer[]>((reducer: any): Peer[] => reducer.peerReducer).subscribe((storedPeers: Peer[]) => {
        this.peers = storedPeers;
        if (!remoteVideo.srcObject && this.peers.length > 0) {
          remoteVideo.srcObject = this.peers[0].stream;
        }
      });

      this.store.select<MoodsInterface>((reducer: any): MoodsInterface => reducer.moodsReducer).subscribe((storedMoods: any) => {
        const moods: FacialExpressionInterface[] = [];
        if (!!!storedMoods?.moods) return;
        const mood_analysis = storedMoods?.moods;
        const keys = Object.keys(mood_analysis);
        keys.forEach((key: string) => {
          moods.push(storedMoods?.moods[key]);
        })
        this.meetingMood = moods;
      });
    } catch (error) {

    }
    $(document).ready(() => {


      // Play Pause button




      // $('.ui .item').on('click', (e: any) => {
      //   $('.ui .item').removeClass('active');
      //   $(e.target).addClass('active');
      //   console.log(e.target);
      //   const title = $(e.target).attr('title');
      //   console.log(title);
      // });

      $('.pointing.menu .item').tab();
      this.initializeWebWorkers();
      this.playPauseButton();
      this.overlayVisibility();
      this.fileUpload();
      this.saturationAndTransparency();
      this.customBackgroundInit();


      // this.localStreamContainer = (document.querySelector('#output_canvas') as any);
      // this.liveStream = new LiveStream(
      //   this.localStreamContainer.captureStream(),
      //   'remote_stream'
      //   );
      // this.liveStream.callAction();
    });
  }

  /**
   * Handles the zooming events
   * @param e event triggered
   */
  setZoomIndex(e: any): void {
    const action: string = e.target.id;
    switch(action) {
      case 'zin':
        if (this.zoomIndex < 3) {
          this.zoomIndex += 0.5;
          // $('#zoom-index').trigger(ZOOM_INDEX_EVENT_NAME, this.zoomIndex);
        }
        break;
      case 'zout':
        if (this.zoomIndex > 1) {
          this.zoomIndex -= 0.5;
          // $('#zoom-index').trigger(ZOOM_INDEX_EVENT_NAME, this.zoomIndex);
        }
        break;
    }
  }

  /**
   * Listens for changes on the zoomIndex variable
   */
  // onZoomIndexChange(): void {
  //   $('#zoom-index').on(ZOOM_INDEX_EVENT_NAME, (e: any, index: number) => {
  //     //handle zooming of the canvas
  //     console.log(`Index: `, index);
  //   });
  // }

  /**
   * Triggers the upload file input element
   */
  fileUpload(): void {
    const triggerUploadButton = $('#upload');
    triggerUploadButton.click(() => {
      try {
        document.getElementById('custom-bg')?.click();
      } catch (error) {
        console.error(error);
      }
    });
  }

  /**
   * Handles Overlay visibility on mouse events
   */
  overlayVisibility(): void {// Right overlay button
    const more = $('.more');
    const rightOverlay = $('.right-overlay');

    more.click( () => {
      rightOverlay.toggleClass('show-overlay');
      return false;
    });

    //Mainstream Overlays
    const mainStreamContainer = $('.main-stream');
    const moodOverlay = $('.mood-overlay');

    mainStreamContainer.on('mouseleave', () => {
      rightOverlay.removeClass('show-overlay');
      moodOverlay.removeClass('hide-mood-overlay');
    });

    mainStreamContainer.on('mouseenter', () => {
      moodOverlay.addClass('hide-mood-overlay');
    });
  }

  /**
   * Handles Play/Pause button events
   */
  playPauseButton(): void {
    const icon = $('.button');
    icon.click( (e: any) => {
        icon.toggleClass('pause');
        return false;
    });
  }

  /**
   * Handle the change of value in the saturation and transparency range input
   */
  saturationAndTransparency(): void {
    const satra = $('#satra');
    const saturate: any = document.querySelector('#saturate');
    const transparency: any = document.querySelector('#bg-transparency');

    satra.change((e: any) => {
      switch (true) {
        case saturate.checked:
          this.c_out.style.filter = `saturate(${saturate.value}%)`;
          break;
        case transparency.checked:
          this.alpha = satra.val();
          break;
        default:
          break;
      }
    });

    satra.on(SATRA_EVENT_NAME, (e: any, id: string) => {
      switch (id) {
        case 'saturate':
          e.target.max = 250;
          e.target.min = 50;
          e.target.step = 10;
          e.target.value = 100;
          break;
        case 'bg-transparency':
          e.target.max = 1;
          e.target.min = 0;
          e.target.step = 0.1;
          e.target.value = 0;
          break;
        default:
          break;
      }
    });
  }

  /**
   * Handles switching between saturation and transparency buttons
   * @param e Event triggered
   */
  saturationAndTransparencyChange(e: any): void {
    const element = e.target;
    const id = element.id;
    if (element.checked) {
      switch (id) {
        case 'saturate':
          $('#satra').trigger(SATRA_EVENT_NAME, id);
          break;
        case 'bg-transparency':
          $('#satra').trigger(SATRA_EVENT_NAME, id);
          break;
        default:
          break;
      }
    }
  }

  /**
   * Initializes the web workers used by the component
   */
  initializeWebWorkers(): void {
    if (typeof Worker !== 'undefined') {
      // Create Color-Range worker
      this.colorRangeWorker = new Worker('../color-range.worker', { type: 'module' });

      this.colorRangeWorker.onerror = (error) => {
        console.log(error);
      }

      this.colorRangeWorker.onmessage = ({ data }) => {
        let result = data;
        if (result.message) {
          this.pixelColors = (result.message as OptimumPixelRangeInterface);
          this.colorKeys = Object.keys(this.pixelColors);
        }
      };
      // colorRangeWorker.postMessage('hello');

      // Create Custom Background worker
      this.bgProcessorWorker = new Worker('../custom-background.worker', { type: 'module' });

      this.bgProcessorWorker.onerror = (error) => {
        console.log(error);
      }

      this.bgProcessorWorker.onmessage = ({ data }) => {
        let result = data;
        if (result.frame) {
          const frame: ImageData = result.frame;
          let w = this.c_out.width;
          let h = this.c_out.height;
          let sw = w * this.zoomIndex;
          let sh = h * this.zoomIndex;
          this.ctx_out.putImageData(frame, 0, 0);
          this.ctx_out.drawImage(this.c_out, 0, 0, w, h, -sw/2 + w/2, -sh/2 + h/2, sw, sh);
        }
      };
      // bgProcessorWorker.postMessage('hello');
    } else {
      // Web workers are not supported in this environment.
      // You should add a fallback so that your program still executes correctly.
    }
  }

  /**
   * Initializes the variables and sets up the environment ready to process media streams
   * It is the begining of background customization and mood detection processes
   */
  customBackgroundInit(): void {
    this.c_out = (document.querySelector('#output_canvas') as HTMLCanvasElement);
    this.ctx_out = (this.c_out.getContext('2d') as CanvasRenderingContext2D);
    const inc = $('#inc-range');
    const dec = $('#dec-range');
    const bw = $('#switch');

    inc.change((e: any) => {
      this.inc_range = e.target.value;
    });

    dec.change((e: any) => {
      this.dec_range = e.target.value;
    });

    bw.change((e: any) => {
      this.black_and_white = e.target.checked;
    });

    this.customBgImage = document.createElement('img');
    this.customBgImage.src = 'assets/images/default-bg.jpg';

    this.customBgVideo = document.createElement('video');
    this.customBgVideo.src = 'assets/videos/bg.mp4';
    this.customBgVideo.autoplay = true;
    this.customBgVideo.muted = true;
    this.customBgVideo.loop = true;
    this.customBgVideo.width = this.customBgVideo.videoWidth;
    this.customBgVideo.height = this.customBgVideo.videoHeight;
    this.customBgVideo.onload = (e) => {
      this.customBgVideo.play();
    }

    this.c_in = document.createElement('canvas');
    this.c_in.setAttribute('width', '850');
    this.c_in.setAttribute('height', '450');
    this.ctx_tmp = (this.c_in.getContext('2d') as CanvasRenderingContext2D);

    this.c_tmp = document.createElement('canvas');
    this.c_tmp.setAttribute('width', '850');
    this.c_tmp.setAttribute('height', '450');
    this.ctx1_tmp = (this.c_tmp.getContext('2d') as CanvasRenderingContext2D);

    //Streams
    const constraints = { audio: false, video: { facingMode: "user" } };
    navigator.mediaDevices.getUserMedia(constraints)
    .then((stream) => {
      /* use the stream */
      this.handleUserStream(stream);
    })
    .catch((err) => {
      /* handle the error */
      console.log(err);
    });
  }

  /**
   * Handles user media stream as captured
   * @param stream user stream from the media inputs
   */
  handleUserStream(stream: MediaStream): void {
    const pauseStream = $('#pause-stream');
    const custom_bg = (document.querySelector('#custom-bg') as HTMLInputElement);
    const greenScreenCapture = $('#green-screen-capture');

    const video = document.createElement('video');
    video.srcObject = stream;
    video.autoplay = true;
    const customBg: CustomBackgroundMedia = {
      video: false,
      image: true,
    }

    let cancelId: any;
    video.onplay = (e) => {
      cancelId = this.processUserStream(video, customBg);
    }
    video.onpause = (e) => {
        try {
          clearTimeout(cancelId);
        } catch (error) {

        }
    }
    pauseStream.click((e: any) => {
      if (e.target.classList.value.includes('pause')) {
        video.pause();
      } else {
        video.play();
      }
      // if (video.paused) {
      //     video.play();
      //     pauseStream.textContent = 'Stop';
      // } else {
      //     video.pause();
      //     pauseStream.textContent = 'Play';
      // }
    });

    greenScreenCapture.change((e: any) => {
      if (e.target.checked) {
        this.toggleGreenScreen = true;
        this.getColorRange(video);
      } else {
        this.toggleGreenScreen = false;
      }
    });

    custom_bg.onchange = (e: any) => {
      // let file = custom_bg.files[0];
      this.backgroundMediaUpload(customBg, custom_bg);
    }
  }

  /**
   * Handles the uploading of media file to replace the uniform video background
   * @param customBg customBg object
   * @param custom_bg background file uploaded
   */
  backgroundMediaUpload(customBg: CustomBackgroundMedia, custom_bg: any): void {
    //Handles video background upload
    const videoReader = new FileReader();
    videoReader.onload = (e: any) => {
      let dataUrl = videoReader.result;
      this.customBgVideo.src = (dataUrl as string);
      this.customBgVideo.play();
      customBg.video = true;
      customBg.image = false;
    }
    //Handles image background upload
    const imageReader = new FileReader();
    imageReader.onload = (e: any) => {
      let dataUrl = imageReader.result;
      this.customBgImage.src = (dataUrl as string);;
      customBg.video = false;
      customBg.image = true;
    }

    let file = custom_bg.files[0];
    if (file.type.startsWith('video')) {
      videoReader.readAsDataURL(file);
    } else if (file.type.startsWith('image')) {
      imageReader.readAsDataURL(file);
    } else {
      alert('file type not supported');
    }
  }

  /**
   * Processes the user stream through various processes.
   * @param video video element containing user stream
   * @param customBg customBg object
   * @returns returns the id of setTimeOut function in computeFrame function
   */
  processUserStream(video: HTMLVideoElement, customBg: CustomBackgroundMedia): any {
    this.getColorRange(video);
    this.moodDetection();
    return this.computeFrame(video, customBg);
  }

  /**
   * Gets the modest and least rgb color components in the video stream
   * @param video video element containing the user stream
   */
  getColorRange(video: HTMLVideoElement) {
    let w = this.c_out.width;
    let h = this.c_out.height;
    let sw = w * this.zoomIndex;
    let sh = h * this.zoomIndex;
    this.ctx1_tmp.drawImage(video, 0, 0, w, h, -sw/2 + w/2, -sh/2 + h/2, sw, sh);
    let frame = this.ctx1_tmp.getImageData(0, 0, w, h);
    this.colorRangeWorker.postMessage({message: frame});
  }

  /**
   * Processes video frames as they are streamed in from camera continuously
   * @param video user stream vdeo element
   * @param customBackground customBg object
   * @returns returns a Timeout object
   */
  computeFrame(video: HTMLVideoElement, customBackground: CustomBackgroundMedia): any {
    if (!this.toggleGreenScreen) {
      return;
    }
    this.ctx_tmp.drawImage(video, 0, 0, this.c_out.width, this.c_out.height);
    let frame = this.ctx_tmp.getImageData(0, 0, this.c_out.width, this.c_out.height);
    let frame2;
    if (customBackground.video) {
      this.ctx_tmp.drawImage(this.mediaCanvas(this.customBgVideo), 0, 0, this.c_out.width, this.c_out.height);
      frame2 = this.ctx_tmp.getImageData(0, 0, this.c_out.width, this.c_out.height);
    } else {
      this.ctx_tmp.drawImage(this.mediaCanvas(this.customBgImage), 0, 0, this.c_out.width, this.c_out.height);
      frame2 = this.ctx_tmp.getImageData(0, 0, this.c_out.width, this.c_out.height);
    }

    if (this.colorKeys !== undefined) {
      let modeMin = this.pixelColors[this.colorKeys[0]].min - this.inc_range;
      modeMin = (modeMin >= 0) ? modeMin : 0;
      let modeMax = this.pixelColors[this.colorKeys[0]].max + this.inc_range;
      modeMax = (modeMax <= 255) ? modeMax : 255;

      let leastMin = this.pixelColors[this.colorKeys[1]].min - this.dec_range;
      leastMin = (leastMin >= 0) ? leastMin : 0;
      let leastMax = this.pixelColors[this.colorKeys[1]].max + this.dec_range;
      leastMax = (leastMax <= 255) ? leastMax : 255;
      let leastRange = {
        min: leastMin,
        max: leastMax
      }
      let modeRange = {
        min: modeMin,
        max: modeMax
      }
      this.bgProcessorWorker.postMessage({mainFrame: frame, customBgFrame: frame2, modeRange, leastRange, colorKeys: this.colorKeys, isMonochrome: this.black_and_white, toggleGreenScreen: this.toggleGreenScreen});
    }

    let id: any;
    id = setTimeout(() => {
      id = this.computeFrame(video, customBackground);
    }, 0);
    return id;
  }

  /**
   * Creates a canvas element depending on the media element passed as @param
   * @param media either video or image element passed on
   * @returns returns a canvas element for further processing
   */
  mediaCanvas(media: HTMLVideoElement | HTMLImageElement): HTMLCanvasElement {
    let canvas: HTMLCanvasElement = document.createElement('canvas');
    let context: CanvasRenderingContext2D = (canvas.getContext('2d') as CanvasRenderingContext2D);
    context.drawImage(media, 0, 0, canvas.width, canvas.height);
    context.fillStyle = `rgba(0, 0, 0, ${this.alpha})`;
    context.fillRect(0, 0, canvas.width, canvas.height);
    return canvas;
  }

  moodDetection() {
    Promise.all([
        // faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        // faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceLandmark68TinyNet.loadFromUri('/models'),
        // faceapi.nets.faceRecognitionNet.loadFromUri('/models')
        faceapi.nets.faceExpressionNet.loadFromUri('/models')
    ])
    .then(() => {
      this.start();
    })
    .catch(error => {
        console.log(error);
    })
  }

  start() {
    const input = (document.getElementById('output_canvas') as HTMLCanvasElement);
    // let media = new Image();
    // moodDetectionWorker.postMessage({media});
    faceapi.detectSingleFace(input, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks(true)
    .withFaceExpressions()
    .then((detections: any) => {
        if (detections !== undefined) {
          let displaySize = { width: input.width, height: input.height };
          let resizedResults = faceapi.resizeResults(detections, displaySize);
          faceapi.draw.drawDetections(input, resizedResults)
          // draw a textbox displaying the face expressions with minimum probability into the canvas
          const minProbability = 0.5
          faceapi.draw.drawFaceExpressions(input, resizedResults, minProbability);

          if (detections.expressions.neutral >= minProbability) {
            this.mood = {
              emoji: '😐',
              expression: EXPRESSIONS.neutral,
              index: Number((detections.expressions.neutral * 100)).toFixed(0)
            }
          } else if (detections.expressions.happy >= minProbability) {
            this.mood = {
              emoji: '🤗',
              expression: EXPRESSIONS.happy,
              index: Number((detections.expressions.happy * 100)).toFixed(0)
            }
          } else if (detections.expressions.surprised >= minProbability) {
            this.mood = {
              emoji: '😲',
              expression: EXPRESSIONS.surprised,
              index: Number((detections.expressions.surprised * 100)).toFixed(0)
            }
          } else if (detections.expressions.sad >= minProbability) {
            this.mood = {
              emoji: '😥',
              expression: EXPRESSIONS.sad,
              index: Number((detections.expressions.sad * 100)).toFixed(0)
            }
          } else if (detections.expressions.angry >= minProbability) {
            this.mood = {
              emoji: '😠',
              expression: EXPRESSIONS.angry,
              index: Number((detections.expressions.angry * 100)).toFixed(0)
            }
          }
          // this.rtc.emit('mood', this.mood);
          this.store.dispatch({type: ACTION_STORE_MOOD, mood: this.mood });
        }
    })
    .catch((error: any) => {
        console.log('Face Detection Error:', error);
    })
    setTimeout(() => {
      this.start();
    }, 10);
  }
}
