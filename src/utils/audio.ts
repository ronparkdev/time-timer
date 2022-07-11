declare global {
  interface Window {
    webkitAudioContext: AudioContext
  }
}

const createAudioContext = (): AudioContext => {
  const AudioContext = window.AudioContext || window.webkitAudioContext
  return new AudioContext()
}

export const AudioUtils = { createAudioContext }
