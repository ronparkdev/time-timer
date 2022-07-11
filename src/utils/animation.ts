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

const animate = async (
  startValue: number,
  targetValue: number,
  duration: number,
  easeFunc: (elapsedTime: number, startValue: number, diffValue: number, duration: number) => number,
  applier: (interpolatedValue: number) => void,
) => {
  return new Promise<void>((resolver) => {
    const tick = (startTime: number, tickTime: number) => {
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
}

// Interpolate the mid value between the start and end values per frame
const animateObject = async <T extends { [K in keyof T]: number }>(
  startValue: T,
  targetValue: T,
  duration: number,
  easeFunc: (elapsedTime: number, startValue: number, diffValue: number, duration: number) => number,
  applier: (interpolatedValue: T) => void,
) => {
  const fields = Object.keys(startValue) as (keyof T)[]

  return new Promise<void>((resolver) => {
    const tick = (startTime: number, tickTime: number) => {
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
}

export const AnimationUtils = {
  animate,
  animateObject,
}
