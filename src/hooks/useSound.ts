import { useCallback, useEffect, useRef, useState } from 'react'

import { AudioUtils } from '../utils/audio'

const useSound = (soundOn: boolean) => {
  const bufferMapRef = useRef<{ [src: string]: AudioBuffer }>({})
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)

  useEffect(() => {
    const replaceAudioContext = (audioContext: AudioContext | null) => {
      setAudioContext((prevAudioContext) => {
        if (prevAudioContext !== audioContext) {
          prevAudioContext?.close()
        }
        return audioContext
      })
    }

    if (soundOn) {
      AudioUtils.requestAudioContext().then(replaceAudioContext)
    } else {
      replaceAudioContext(null)
    }
  }, [soundOn, setAudioContext])

  const fetchBuffer = useCallback(
    async (src: string, audioContext: AudioContext) => {
      if (bufferMapRef.current[src]) {
        return bufferMapRef.current[src]
      }

      const buffer = await fetch(src)
        .then((res) => res.arrayBuffer())
        .then((buffer) => audioContext.decodeAudioData(buffer))
      bufferMapRef.current[src] = buffer

      return buffer
    },
    [bufferMapRef],
  )

  const play = useCallback(
    async (src: string) => {
      if (audioContext) {
        const source = audioContext.createBufferSource()
        const buffer = await fetchBuffer(src, audioContext)
        source.buffer = buffer
        source.connect(audioContext.destination)
        source.start()
      }
    },
    [audioContext, fetchBuffer],
  )

  return { play }
}

export default useSound
