// components/SelectionBox.jsx
import React from 'react';
import { Circle, G, Line, Rect } from 'react-native-svg';

const HANDLE_SIZE = 14;

export default function Box({ path, onTransformStart }) {
  const { meta, rotation, scale } = path;
  const { x, y, width, height, centerX, centerY } = meta;

  // হ্যান্ডেল পয়েন্টগুলো
  const handles = [
    { type: 'topLeft', cx: x, cy: y },
    { type: 'topRight', cx: x + width, cy: y },
    { type: 'bottomLeft', cx: x, cy: y + height },
    { type: 'bottomRight', cx: x + width, cy: y + height },
  ];

  return (
    <G transform={`rotate(${rotation}, ${centerX}, ${centerY}) translate(${centerX}, ${centerY}) scale(${scale}) translate(${-centerX}, ${-centerY})`}>
      {/* বাউন্ডিং বক্স লাইন */}
      <Rect
        x={x - 2} y={y - 2} width={width + 4} height={height + 4}
        fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4, 4"
      />

      {/* ৪টি কর্নার হ্যান্ডেল */}
      {handles.map((h) => (
        <Circle
          key={h.type} cx={h.cx} cy={h.cy} r={HANDLE_SIZE / 2}
          fill="white" stroke="#3b82f6" strokeWidth="2"
          onPressIn={() => onTransformStart(h.type)}
        />
      ))}

      {/* রোটেশন হ্যান্ডেল (মাথায়) */}
      <Line x1={centerX} y1={y} x2={centerX} y2={y - 30} stroke="#3b82f6" strokeWidth="1.5" />
      <Circle
        cx={centerX} cy={y - 35} r={8}
        fill="#facc15" stroke="#3b82f6" strokeWidth="2"
        onPressIn={() => onTransformStart('rotate')}
      />
    </G>
  );
}