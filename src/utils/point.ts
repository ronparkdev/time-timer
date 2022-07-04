const getDegree = (x: number, y: number) => {
  return (Math.atan2(y, x) / Math.PI) * 180
}

const getDistance = (x: number, y: number) => {
  return Math.sqrt(x * x + y * y)
}

export const PointUtils = {
  getDegree,
  getDistance,
}
