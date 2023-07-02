import { useCallback, useEffect, useLayoutEffect, useMemo } from 'react'
import useLocalStorage from 'use-local-storage'

export enum ThemeType {
  DARK = 'dark',
  LIGHT = 'light',
}

const useTheme = () => {
  const defaultTheme = useMemo(() => {
    const isMatched = window.matchMedia('(prefers-color-scheme: dark)').matches
    return isMatched ? ThemeType.DARK : ThemeType.LIGHT
  }, [])

  const [theme, setTheme] = useLocalStorage('theme', defaultTheme)

  useLayoutEffect(() => {
    document.body.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    document.body.classList.add('use-transition')
  }, [])

  const toggleTheme = useCallback(
    () => setTheme((prev) => (prev === ThemeType.DARK ? ThemeType.LIGHT : ThemeType.DARK)),
    [setTheme],
  )

  return {
    theme,
    setTheme,
    toggleTheme,
  }
}

export default useTheme
