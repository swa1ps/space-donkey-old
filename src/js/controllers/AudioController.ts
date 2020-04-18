import { findPitch } from 'pitchy';

const LISTEN_INTERVAL = 100;

export class AudioController {
  private micRef:  NodeJS.Timeout;
  private audioContext: AudioContext;
  private analyserNode: AnalyserNode;
  private stream: MediaStream;
  
  isListen = false;

  constructor() {
    this.audioContext = new AudioContext();
    this.analyserNode = this.audioContext.createAnalyser();
    console.log('init audio controller')
  }

  private createListenInterval = (callback: (pitch: number, clarity: number) => void): NodeJS.Timeout => {
    return setInterval(() => {
      let data = new Float32Array(this.analyserNode.fftSize);
      this.analyserNode.getFloatTimeDomainData(data);
      let [pitch, clarity] = findPitch(data, this.audioContext.sampleRate);
      callback(pitch, clarity);
    }, LISTEN_INTERVAL);
  }

  startListen = async (onPitchChanged: (pitch: number, clarity: number) => void) => {
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    let sourceNode = this.audioContext.createMediaStreamSource(this.stream);
    sourceNode.connect(this.analyserNode);

    this.micRef = this.createListenInterval(onPitchChanged);
    this.isListen = true;
  }

  stopListen = () => {
    clearInterval(this.micRef);
    this.stream.getAudioTracks().forEach(track => {
      track.stop();
    });
    this.stream = null;
    this.isListen = false;
  }
}
