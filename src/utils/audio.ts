declare global {
  interface Window {
    webkitAudioContext: AudioContext
  }
}

const requestAudioContext = (): Promise<AudioContext | null> => {
  return navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then(() => {
      AudioContext = window.AudioContext || window.webkitAudioContext
      return new AudioContext()
    })
    .catch((e) => {
      console.error(`Audio permissions denied: ${e}`)
      return null
    })
}

export const AudioUtils = { requestAudioContext }
