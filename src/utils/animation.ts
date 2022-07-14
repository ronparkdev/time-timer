// Reference about ease : https://easings.net
type EaseFunc = (elapsedTime: number, startValue: number, diffValue: number, duration: number) => number

const linearTween: EaseFunc = (t, b, c, d) => (c * t) / d + b
const easeInQuad: EaseFunc = (t, b, c, d) => c * (t / d) * (t / d) + b
const easeOutQuad: EaseFunc = (t, b, c, d) => -c * (t / d) * (t / d - 2) + b

export const EaseFuncs = {
  linearTween,
  easeInQuad,
  easeOutQuad,
} as const

const animate = (
  startValue: number,
  targetValue: number,
  duration: number,
  easeFunc: (elapsedTime: number, startValue: number, diffValue: number, duration: number) => number,
  applier: (interpolatedValue: number) => void,
) => {
  let isCanceled = false

  const promise = new Promise<void>((resolver) => {
    const tick = (startTime: number, tickTime: number) => {
      if (isCanceled) {
        return
      }

      const elapsedTime = tickTime - startTime
      const isExpired = elapsedTime >= duration

      const from = startValue
      const to = targetValue
      const interpolatedValue = easeFunc(elapsedTime, from, to - from, duration)

      applier(isExpired ? targetValue : interpolatedValue)
      if (isExpired) {
        resolver()
      } else {
        requestAnimationFrame((time) => tick(startTime, time))
      }
    }
    requestAnimationFrame((time) => tick(time, time))
  })

  return {
    promise,
    cancel() {
      isCanceled = true
    },
  }
}

// Interpolate the mid value between the start and end values per frame
const animateObject = <T extends { [K in keyof T]: number }>(
  startValue: T,
  targetValue: T,
  duration: number,
  easeFunc: (elapsedTime: number, startValue: number, diffValue: number, duration: number) => number,
  applier: (interpolatedValue: T) => void,
) => {
  let isCanceled = false
  const fields = Object.keys(startValue) as (keyof T)[]

  const promise = new Promise<void>((resolver) => {
    const tick = (startTime: number, tickTime: number) => {
      if (isCanceled) {
        return
      }

      const elapsedTime = tickTime - startTime
      const isExpired = elapsedTime >= duration

      const interpolatedValue = fields.reduce((state, key) => {
        const from = startValue[key]
        const to = targetValue[key]
        const value = easeFunc(elapsedTime, from, to - from, duration)
        return {
          ...state,
          [key]: value,
        }
      }, {}) as T

      applier(isExpired ? targetValue : interpolatedValue)
      if (isExpired) {
        resolver()
      } else {
        requestAnimationFrame((time) => tick(startTime, time))
      }
    }
    requestAnimationFrame((time) => tick(time, time))
  })

  return {
    promise,
    cancel() {
      isCanceled = true
    },
  }
}

export const AnimationUtils = {
  animate,
  animateObject,
}
