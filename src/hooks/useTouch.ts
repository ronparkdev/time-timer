import { useEffect, useRef } from 'react'

type TouchType = 'down' | 'move' | 'up'
type TouchPoint = { clientX: number; clientY: number }
const TOUCH_POINT_DEFAULT: TouchPoint = { clientX: 0, clientY: 0 }

export type TouchHandler = (params: {
  clientX: number
  clientY: number
  type: TouchType
  prev: TouchPoint
  diff: TouchPoint
}) => void

const useTouch = ({ handler, forceUseMouse }: { handler: TouchHandler; forceUseMouse: boolean }) => {
  const isMouseDownRef = useRef<boolean>(false)
  const touchIdRef = useRef<number | null>(null)
  const prevPointRef = useRef<TouchPoint>(TOUCH_POINT_DEFAULT)
  const diffPointRef = useRef<TouchPoint>(TOUCH_POINT_DEFAULT)

  useEffect(() => {
    const isTouchDevice = !forceUseMouse && ('ontouchstart' in window || navigator.maxTouchPoints > 0)

    const mouseHandler = (e: MouseEvent) => {
      const { clientX, clientY } = e
      switch (e.type) {
        case 'mousedown': {
          isMouseDownRef.current = true
          diffPointRef.current = TOUCH_POINT_DEFAULT

          handler({ clientX, clientY, type: 'down', prev: prevPointRef.current, diff: diffPointRef.current })

          prevPointRef.current = { clientX, clientY }
          break
        }
        case 'mousemove': {
          if (isMouseDownRef.current) {
            diffPointRef.current.clientX += clientX
            diffPointRef.current.clientY += clientY

            handler({ clientX, clientY, type: 'move', prev: prevPointRef.current, diff: diffPointRef.current })

            prevPointRef.current = { clientX, clientY }
          }
          break
        }
        case 'mouseup': {
          if (isMouseDownRef.current) {
            isMouseDownRef.current = false
            handler({ clientX, clientY, type: 'up', prev: prevPointRef.current, diff: diffPointRef.current })
          }
          break
        }
      }
    }

    const touchHandler = (e: TouchEvent) => {
      console.log(e.type)
      switch (e.type) {
        case 'touchstart': {
          if (touchIdRef.current === null) {
            const touch = e.touches[0]
            const { clientX, clientY } = touch
            touchIdRef.current = touch.identifier

            diffPointRef.current = TOUCH_POINT_DEFAULT

            handler({ clientX, clientY, type: 'down', prev: prevPointRef.current, diff: diffPointRef.current })

            prevPointRef.current = { clientX, clientY }
          }
          break
        }
        case 'touchmove': {
          for (let i = 0; i < e.touches.length; i++) {
            const touch = e.touches[i]
            const { clientX, clientY } = touch

            diffPointRef.current.clientX += clientX
            diffPointRef.current.clientY += clientY

            if (touch.identifier === touchIdRef.current) {
              handler({ clientX, clientY, type: 'move', prev: prevPointRef.current, diff: diffPointRef.current })
            }

            prevPointRef.current = { clientX, clientY }
          }
          break
        }
        case 'touchend':
        case 'touchcancel': {
          if (touchIdRef.current !== null) {
            const { clientX, clientY } = prevPointRef.current

            handler({ clientX, clientY, type: 'up', prev: prevPointRef.current, diff: diffPointRef.current })
          }
          touchIdRef.current = null
          break
        }
      }
    }

    const mouseEventNames = ['mousedown', 'mousemove', 'mouseup'] as const
    const touchEventNames = ['touchstart', 'touchmove', 'touchend', 'touchcancel'] as const
    if (isTouchDevice) {
      touchEventNames.forEach((eventName) => window.addEventListener(eventName, touchHandler))
      return () => touchEventNames.forEach((eventName) => window.removeEventListener(eventName, touchHandler))
    } else {
      mouseEventNames.forEach((eventName) => window.addEventListener(eventName, mouseHandler))
      return () => mouseEventNames.forEach((eventName) => window.removeEventListener(eventName, mouseHandler))
    }
  }, [handler, forceUseMouse])
}

export default useTouch
