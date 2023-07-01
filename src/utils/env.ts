const buildTarget = process.env.REACT_APP_BUILD_TARGET

const getBuildTarget = (): 'extension' | 'web' => {
  if (buildTarget === 'EXT') {
    return 'extension'
  }

  return 'web'
}

export const EnvironmentUtils = {
  getBuildTarget,
}
