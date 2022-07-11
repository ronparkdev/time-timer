import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import useLocalStorage from 'use-local-storage'

import './App.scss'
import tickSoundUri from './assets/tick.wav'
import useSound from './hooks/useSound'
import useTheme from './hooks/useTheme'
import { PointUtils } from './utils/point'

const MIN_LEFT_SECONDS = 60 * 1
const MAX_LEFT_SECONDS = 60 * 60

const App = () => {
  const leftSecondsRef = useRef<number>(10 * 60)
  const [enabled, setEnabled] = useState<boolean>(false)
  const [editing, setEditing] = useState<boolean>(false)
  const [isFinished, setFinished] = useState<boolean>(false)
  const [isSoundOn, setSoundOn] = useLocalStorage('sound', false)
  const { play: playSound, handleAfterUserInteraction } = useSound(isSoundOn)

  const { toggleTheme } = useTheme()

  const clockProcessLeftRef = useRef<HTMLDivElement>(null)
  const clockProcessRightRef = useRef<HTMLDivElement>(null)

  const setLeftSeconds = useCallback(
    (leftSeconds: number) => {
      leftSecondsRef.current = leftSeconds
      const progress = Math.max(0, Math.min(3600, leftSeconds)) / 3600

      const leftDeg = `${Math.max(0, 0.5 - progress) * 360}deg`
      const rightDeg = `${Math.min(0.5, 1 - progress) * 360}deg`

      const leftStyle = clockProcessLeftRef.current?.style
      const rightStyle = clockProcessRightRef.current?.style

      if (leftStyle?.getPropertyValue('--degree') !== leftDeg) {
        leftStyle?.setProperty('--degree', leftDeg)
      }
      if (rightStyle?.getPropertyPriority('--degree') !== rightDeg) {
        rightStyle?.setProperty('--degree', rightDeg)
      }
    },
    [leftSecondsRef],
  )

  useLayoutEffect(() => {
    setLeftSeconds(10 * 60)
  }, [setLeftSeconds])

  useEffect(() => {
    if (enabled && !editing) {
      const t = setInterval(() => {
        const leftSeconds = leftSecondsRef.current
        const nextLeftSeconds = Math.max(0, leftSeconds - 1)
        if (nextLeftSeconds <= 0) {
          setFinished(true)
        }
        setLeftSeconds(nextLeftSeconds)
      }, 1000)

      return () => clearInterval(t)
    }
  }, [enabled, editing, setFinished, setLeftSeconds])

  useEffect(() => {
    if (handleAfterUserInteraction) {
      return
    }

    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0

    let isTouchDown = false

    let prev: { clientX: number; clientY: number } = { clientX: 0, clientY: 0 }
    let diff: { clientX: number; clientY: number } = { clientX: 0, clientY: 0 }

    const getDegree = (clientX: number, clientY: number) => {
      const { clientWidth, clientHeight } = document.documentElement
      return PointUtils.getDegree(clientX - clientWidth / 2, clientY - clientHeight / 2)
    }

    const getDistance = (clientX: number, clientY: number) => {
      const { clientWidth, clientHeight } = document.documentElement
      return PointUtils.getDistance(clientX - clientWidth / 2, clientY - clientHeight / 2)
    }

    const handler = (clientX: number, clientY: number, type: 'down' | 'move' | 'up') => {
      switch (type) {
        case 'down': {
          const { clientWidth } = document.documentElement

          if (getDistance(clientX, clientY) < clientWidth * 0.4) {
            isTouchDown = true
            diff = { clientX: 0, clientY: 0 }
            setEditing(true)
          }
          break
        }
        case 'move': {
          if (isTouchDown && prev) {
            const deg = getDegree(clientX, clientY)
            const prevDeg = getDegree(prev.clientX, prev.clientY)
            let diffDig = deg - prevDeg
            if (diffDig > 180) {
              diffDig -= 360
            } else if (diffDig < -180) {
              diffDig += 360
            }

            const leftSeconds = leftSecondsRef.current
            const nextLeftSeconds = Math.max(
              MIN_LEFT_SECONDS,
              Math.min(MAX_LEFT_SECONDS, Math.floor(leftSeconds - (diffDig / 360) * 3600)),
            )
            setLeftSeconds(nextLeftSeconds)

            if (Math.floor(leftSeconds / 60) !== Math.floor(nextLeftSeconds / 60)) {
              playSound(tickSoundUri)
            }

            diff.clientX += Math.abs(clientX - prev.clientX)
            diff.clientY += Math.abs(clientY - prev.clientY)
          }
          break
        }
        case 'up': {
          if (isTouchDown) {
            isTouchDown = false

            const distance = PointUtils.getDistance(diff.clientX, diff.clientY)
            if (distance < 3) {
              if (isFinished) {
                setLeftSeconds(10 * 60)
                setEnabled(false)
              } else {
                setEnabled((enabled) => !enabled)
              }
            } else {
              setEnabled(true)
            }
            setFinished(false)
            setEditing(false)
            break
          }
        }
      }
      prev = { clientX, clientY }
    }

    const mouseHandler = (e: MouseEvent) => {
      const { clientX, clientY } = e
      switch (e.type) {
        case 'mousedown': {
          handler(clientX, clientY, 'down')
          break
        }
        case 'mousemove': {
          handler(clientX, clientY, 'move')
          break
        }
        case 'mouseup': {
          handler(clientX, clientY, 'up')
          break
        }
      }
    }

    let touchId: number | null = null

    const touchHandler = (e: TouchEvent) => {
      switch (e.type) {
        case 'touchstart': {
          if (touchId === null) {
            const touch = e.touches[0]
            const { clientX, clientY } = touch
            touchId = touch.identifier
            handler(clientX, clientY, 'down')
          }
          break
        }
        case 'touchmove': {
          for (let i = 0; i < e.touches.length; i++) {
            const touch = e.touches[i]
            const { clientX, clientY } = touch

            if (touch.identifier === touchId) {
              handler(clientX, clientY, 'move')
            }
          }
          break
        }
        case 'touchend':
        case 'touchcancel': {
          if (touchId !== null && prev) {
            const { clientX, clientY } = prev
            handler(clientX, clientY, 'up')
          }
          touchId = null
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
  }, [handleAfterUserInteraction, playSound, isFinished, setLeftSeconds])

  return (
    <div className={`App ${isFinished ? 'finished' : ''}`}>
      <div className="clock__container">
        <div className="clock__axis" />
        <div className="clock__indicator__wrapper">
          {Array.from({ length: 60 }).map((_, offset) => (
            <section key={offset} className="clock__indicator" />
          ))}
        </div>
        <div className="clock__label__wrapper">
          {Array.from({ length: 12 }).map((_, offset) => (
            <section key={offset} className="clock__label">
              {offset * 5}
            </section>
          ))}
        </div>
        <div
          className="clock__progress__wrapper"
          style={{
            transform: enabled && !editing ? 'scale(1)' : 'scale(0.93)',
            visibility: isFinished ? 'hidden' : 'inherit',
          }}>
          <div className={`clock__progress__left`} ref={clockProcessLeftRef} />
          <div className={`clock__progress__right`} ref={clockProcessRightRef} />
        </div>
      </div>
      <div className="button__group">
        <button
          className={`button__sound ${isSoundOn ? 'on' : 'off'}`}
          onClick={() => {
            setSoundOn((prev) => !prev)
          }}
        />
        <button className="button__theme" onClick={toggleTheme} />
      </div>
      {handleAfterUserInteraction && (
        <div className="guide_user_interaction" onClick={() => handleAfterUserInteraction()}>
          Click to play
        </div>
      )}
    </div>
  )
}

export default App
