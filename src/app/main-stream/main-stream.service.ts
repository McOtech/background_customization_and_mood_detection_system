import { Injectable } from '@angular/core';
import { WorkerMessageInterface } from '../workers/interfaces/message.interface';

@Injectable({
  providedIn: 'root'
})
export class MainStreamService {
  private readonly cbw: Worker;
  private readonly crw: Worker;

  constructor() {
    this.cbw = new Worker('/app/workers/custom_bg.worker.js');
    this.crw = new Worker('/app/workers/color_range.worker.js');
  }

  customBackgroundWorkerMessage(): Promise<WorkerMessageInterface> {
    return (new Promise((resolve, reject) => {
      try {
        this.cbw.onmessage = (e: MessageEvent) => {
          resolve((e.data as WorkerMessageInterface));
        };
        this.cbw.onerror = (error) => {
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    }));
  }

  colorRangeWorkerMessage(): Promise<WorkerMessageInterface> {
    return (new Promise((resolve, reject) => {
      try {
        this.crw.onmessage = (e: MessageEvent) => {
          resolve((e.data as WorkerMessageInterface));
        };
        this.crw.onerror = (error) => {
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    }));
  }

  processColorRange(frame: ImageData): Promise<void> {
    return (new Promise((resolve, reject) => {
      try {
        this.crw.postMessage(({message: frame} as WorkerMessageInterface));
        resolve();
      } catch (error) {
        reject(error);
      }
    }));
  }
}
