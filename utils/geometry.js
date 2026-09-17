// utils/geometry.js

// পাথের মেটা ডাটা (বক্স, সেন্টার) বের করা
export const getPathMeta = (pathData) => {
  const points = pathData.replace(/[ML]/g, '').trim().split(/\s+/);
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (let i = 0; i < points.length; i += 2) {
    const x = parseFloat(points[i]);
    const y = parseFloat(points[i + 1]);
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
  }
  return {
    x: minX, y: minY,
    width: maxX - minX, height: maxY - minY,
    centerX: (minX + maxX) / 2, centerY: (minY + maxY) / 2
  };
};

// রোটেশন থাকা অবস্থায় মাউস পয়েন্টকে ইনভার্স ট্রান্সফর্ম করা
export function getTransformedPoint(clientX, clientY, cx, cy, rotation) {
  const angleRad = -rotation * (Math.PI / 180);
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);
  const tx = clientX - cx;
  const ty = clientY - cy;
  return {
    x: tx * cos - ty * sin + cx,
    y: tx * sin + ty * cos + cy,
  };
}