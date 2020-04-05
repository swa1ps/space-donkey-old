import { findPitch } from 'pitchy';

export function listenMic(
  interval: number,
  analyserNode: AnalyserNode,
  audioContext: AudioContext,
  callback: (pitch: number, clarity: number) => void
): NodeJS.Timeout {
  return setInterval(() => {
    let data = new Float32Array(analyserNode.fftSize);
    analyserNode.getFloatTimeDomainData(data);
    let [pitch, clarity] = findPitch(data, audioContext.sampleRate);
    callback(pitch, clarity);
  }, interval);
}

export function stopStream(stream: MediaStream) {
  stream.getAudioTracks().forEach(track => {
    track.stop();
  });
}