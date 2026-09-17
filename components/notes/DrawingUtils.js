// DrawingUtils.js
export const COLORS = ['#fff', '#b7c7ff', '#ff6b6b', '#ffd93d', '#6bffbc', '#ff9ff3'];

export const getPathMeta = (pathData) => {
  if (!pathData || typeof pathData !== 'string') return null;
  const points = pathData.replace(/[ML]/g, '').trim().split(/\s+/);
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  
  for (let i = 0; i < points.length; i += 2) {
    const x = parseFloat(points[i]);
    const y = parseFloat(points[i + 1]);
    if (!isNaN(x) && !isNaN(y)) {
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
  }
  if (minX === Infinity) return null;
  return {
    x: (minX + maxX) / 2, y: (minY + maxY) / 2,
    minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY
  };
};