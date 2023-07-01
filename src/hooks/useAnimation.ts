import { useCallback, useEffect, useState } from 'react'

import { AnimationUtils, EaseFunc } from '../utils/animation'

const useAnimation = (render: (value: number) => void) => {
  const [canceler, setCanceler] = useState<() => void>()

  useEffect(() => () => canceler?.(), [canceler])

  const animate = useCallback(
    async ({
      start,
      end,
      duration,
      easeFunc,
    }: {
      start: number
      end: number
      duration: number
      easeFunc: EaseFunc
    }) => {
      const result = AnimationUtils.animate(start, end, duration, easeFunc, render)
      setCanceler((prevCanceler) => {
        prevCanceler?.()
        return result.cancel
      })
      await result.promise
    },
    [render, setCanceler],
  )

  return animate
}

export default useAnimation
