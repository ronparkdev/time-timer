import { useCallback, useEffect, useRef, useState } from 'react'

import { AudioUtils } from '../utils/audio'

const useSound = (soundOn: boolean) => {
  const bufferMapRef = useRef<{ [src: string]: AudioBuffer }>({})
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)
  const [needUserInteraction, setNeedUserInteraction] = useState<boolean>(false)
  const [failedSources, setFailedSources] = useState<string[]>([])

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
        .then((buffer) => new Promise<AudioBuffer>((resolve) => audioContext.decodeAudioData(buffer, resolve)))

      return (bufferMapRef.current[src] = buffer)
    },
    [bufferMapRef],
  )

  const play = useCallback(
    async (src: string) => {
      if (audioContext && !failedSources.includes(src)) {
        try {
          const source = audioContext.createBufferSource()
          const buffer = await fetchBuffer(src, audioContext)
          source.buffer = buffer
          source.connect(audioContext.destination)
          source.start()
        } catch (e) {
          setFailedSources((prevSources) => [...prevSources, src])
          window.document.body.innerText = (e as unknown as any).stack
        }
      }
    },
    [failedSources, audioContext, fetchBuffer],
  )

  return { play, handleAfterUserInteraction: needUserInteraction ? handleAfterUserInteraction : null }
}

export default useSound
