import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react'

interface Props {
  src: string
  maxSoundCount?: number
}

export interface SoundPlayerElement {
  play: () => void
}

const checkAudioElementPlaying = (audioElement: HTMLAudioElement) => audioElement.duration > 0 && !audioElement.paused

const SoundPlayer: React.ForwardRefRenderFunction<SoundPlayerElement, Props> = (
  { src, maxSoundCount = Number.MAX_SAFE_INTEGER },
  ref,
) => {
  const audioElementsRef = useRef<HTMLAudioElement[]>([])
  const [soundCount, setSoundCount] = useState<number>(1)

  useImperativeHandle(ref, () => ({
    play: () => {
      setSoundCount((prevSoundCount) => {
        const matchedAudioElement = audioElementsRef.current.find(
          (audioElement) => !checkAudioElementPlaying(audioElement),
        )

        if (!matchedAudioElement) {
          return Math.min(prevSoundCount + 1, maxSoundCount)
        } else {
          const bestMatchedAudioElement = [...audioElementsRef.current].sort(
            (e1, e2) => e2.currentTime - e1.currentTime,
          )[0]
          bestMatchedAudioElement?.play()
          return prevSoundCount
        }
      })
    },
  }))

  return (
    <>
      {Array.from({ length: soundCount }).map((_, offset) => (
        <audio
          src={src}
          key={offset}
          preload={'auto'}
          autoPlay={offset > 0}
          loop={false}
          ref={(ref) => {
            if (!ref) {
              return
            }
            if (offset < audioElementsRef.current.length) {
              audioElementsRef.current[offset] = ref
            } else {
              audioElementsRef.current.push(ref)
            }
          }}
        />
      ))}
    </>
  )
}

export default forwardRef(SoundPlayer)
