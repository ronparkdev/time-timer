import { useCallback, useEffect, useRef, useState } from 'react'

import { AudioUtils } from '../utils/audio'

const useSound = (soundOn: boolean) => {
  const bufferMapRef = useRef<{ [src: string]: AudioBuffer }>({})
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)
  const [needUserInteraction, setNeedUserInteraction] = useState<boolean>(false)

  useEffect(() => {
    if (audioContext?.state === 'suspended') {
      setNeedUserInteraction(true)
    }
  }, [soundOn, audioContext])

  const handleAfterUserInteraction = useCallback(async () => {
    if (audioContext) {
      await audioContext.resume()
      setNeedUserInteraction(false)
    }
  }, [audioContext])

  useEffect(() => {
    if (soundOn) {
      setAudioContext(AudioUtils.createAudioContext())
    } else {
      setAudioContext(null)
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

  return { play, handleAfterUserInteraction: needUserInteraction ? handleAfterUserInteraction : null }
}

export default useSound
