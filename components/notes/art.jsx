
//DrawingCanvas.jsx
import { Feather, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useMemo, useRef, useState } from 'react';
import { Modal, PanResponder, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, G, Path, Rect, Image as SvgImage } from 'react-native-svg';
import ViewShot from 'react-native-view-shot';

import { CANVAS_HEIGHT, CANVAS_WIDTH, styles } from './DrawingCanvas.style';
import { COLORS, getPathMeta } from './DrawingUtils';

export default function DrawingCanvas({ visible, onClose, onInsert }) {
  const [paths, setPaths] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const [selectedPathIndex, setSelectedPathIndex] = useState(null);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectionBox, setSelectionBox] = useState(null);
  const [selectedColor, setSelectedColor] = useState('#fff');
  const [isEraser, setIsEraser] = useState(false);
  const [isHighlighter, setIsHighlighter] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);

  const viewShotRef = useRef(null);
  const moveOffset = useRef({ x: 0, y: 0 });

  // টুল লজিক (এরর ফিক্সড)
  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    setIsEraser(false);
    setIsHighlighter(false);
    setSelectedPathIndex(null);
  };

  const toggleEraser = () => {
    setIsEraser(!isEraser);
    setIsSelectMode(false);
    setIsHighlighter(false);
    setSelectedPathIndex(null);
  };

  const toggleHighlighter = () => {
    setIsHighlighter(!isHighlighter);
    setIsEraser(false);
    setIsSelectMode(false);
    setSelectedPathIndex(null);
  };

  // ইমেজ ইম্পোর্ট ফাংশন
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      const { uri, width, height } = result.assets[0];
      const aspectRatio = width / height;
      const displayWidth = CANVAS_WIDTH * 0.7; 
      const displayHeight = displayWidth / aspectRatio;

      const newImageNode = {
        type: 'image',
        uri: uri,
        x: (CANVAS_WIDTH - displayWidth) / 2,
        y: (CANVAS_HEIGHT - displayHeight) / 2,
        width: displayWidth,
        height: displayHeight,
        rotation: 0,
        scale: 1,
        translateX: 0,
        translateY: 0,
        d: `M${(CANVAS_WIDTH - displayWidth)/2} ${(CANVAS_HEIGHT - displayHeight)/2} h${displayWidth} v${displayHeight} h${-displayWidth} z`
      };
      setPaths(prev => [...prev, newImageNode]);
    }
  };

  // অবজেক্ট সিলেকশন চেক
  const checkSelection = (box) => {
    if (!box) return;
    const isTap = box.width < 10 && box.height < 10;
    const searchX = isTap ? box.startX : box.x;
    const searchY = isTap ? box.startY : box.y;

    const foundIndex = paths.findLastIndex((p) => {
      const meta = getPathMeta(p.d);
      if (!meta) return false;
      const x = meta.x + (p.translateX || 0);
      const y = meta.y + (p.translateY || 0);
      const w = meta.width * (p.scale || 1);
      const h = meta.height * (p.scale || 1);

      if (isTap) {
        return searchX >= x - w/2 && searchX <= x + w/2 && searchY >= y - h/2 && searchY <= y + h/2;
      }
      return x >= box.x && x <= box.x + box.width && y >= box.y && y <= box.y + box.height;
    });
    setSelectedPathIndex(foundIndex !== -1 ? foundIndex : null);
  };

  // আনডু-রিডু লজিক
  const undo = () => {
    if (paths.length > 0) {
      const last = paths[paths.length - 1];
      setRedoStack(p => [...p, last]);
      setPaths(p => p.slice(0, -1));
      setSelectedPathIndex(null);
    }
  };

  const redo = () => {
    if (redoStack.length > 0) {
      const next = redoStack[redoStack.length - 1];
      setPaths(p => [...p, next]);
      setRedoStack(p => p.slice(0, -1));
    }
  };

  const handleGestureTransform = (evt, type) => {
    if (selectedPathIndex === null) return;
    const { locationX, locationY } = evt.nativeEvent;
    const newPaths = [...paths];
    const target = newPaths[selectedPathIndex];
    const meta = getPathMeta(target.d);
    if (!meta) return;

    const centerX = meta.x + (target.translateX || 0);
    const centerY = meta.y + (target.translateY || 0);

    if (type === 'rotate') {
      const angle = Math.atan2(locationY - centerY, locationX - centerX) * (180 / Math.PI) + 90;
      target.rotation = angle;
    } else if (type === 'scale') {
      const dist = Math.sqrt(Math.pow(locationX - centerX, 2) + Math.pow(locationY - centerY, 2));
      const initialDist = Math.sqrt(Math.pow(meta.width / 2, 2) + Math.pow(meta.height / 2, 2));
      target.scale = Math.max(0.3, Math.min(5.0, dist / initialDist));
    }
    setPaths(newPaths);
  };

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      if (isSelectMode) {
        if (selectedPathIndex !== null) {
          const target = paths[selectedPathIndex];
          const meta = getPathMeta(target.d);
          const objX = meta.x + (target.translateX || 0);
          const objY = meta.y + (target.translateY || 0);
          const dist = Math.sqrt(Math.pow(locationX - objX, 2) + Math.pow(locationY - objY, 2));
          if (dist < 60) {
            setIsTransforming(true);
            moveOffset.current = { x: locationX - (target.translateX || 0), y: locationY - (target.translateY || 0) };
            return;
          }
        }
        setSelectionBox({ x: locationX, y: locationY, width: 0, height: 0, startX: locationX, startY: locationY });
      } else {
        setCurrentPath([`M${locationX.toFixed(1)} ${locationY.toFixed(1)}`]);
      }
    },
    onPanResponderMove: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      if (isSelectMode && isTransforming && selectedPathIndex !== null) {
        const newPaths = [...paths];
        newPaths[selectedPathIndex].translateX = locationX - moveOffset.current.x;
        newPaths[selectedPathIndex].translateY = locationY - moveOffset.current.y;
        setPaths(newPaths);
      } else if (isSelectMode && selectionBox) {
        setSelectionBox(prev => ({
          ...prev,
          x: Math.min(locationX, prev.startX),
          y: Math.min(locationY, prev.startY),
          width: Math.abs(locationX - prev.startX),
          height: Math.abs(locationY - prev.startY),
        }));
      } else if (!isSelectMode) {
        setCurrentPath(prev => [...prev, `L${locationX.toFixed(1)} ${locationY.toFixed(1)}`]);
      }
    },
    onPanResponderRelease: () => {
      if (isSelectMode) {
        if (!isTransforming && selectionBox) checkSelection(selectionBox);
        setSelectionBox(null);
        setIsTransforming(false);
      } else if (currentPath.length > 0) {
        setPaths(prev => [...prev, { 
          d: currentPath.join(' '), 
          color: isEraser ? '#16171d' : selectedColor, 
          width: isEraser ? 25 : (isHighlighter ? 18 : 3), 
          opacity: isHighlighter ? 0.4 : 1,
          rotation: 0, scale: 1, translateX: 0, translateY: 0
        }]);
        setCurrentPath([]);
      }
    },
  }), [isSelectMode, paths, selectionBox, currentPath, selectedColor, isEraser, isHighlighter, isTransforming, selectedPathIndex]);

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={styles.drawModal}>
        <View style={styles.drawHeader}>
          <TouchableOpacity onPress={onClose}><MaterialIcons name="close" size={28} color="#fff" /></TouchableOpacity>
          <View style={styles.colorPalette}>
            {COLORS.map(color => (
              <TouchableOpacity key={color}
                onPress={() => { setSelectedColor(color); setIsEraser(false); setIsSelectMode(false); setIsHighlighter(false); }}
                style={[styles.colorCircle, { backgroundColor: color, borderWidth: selectedColor === color && !isEraser && !isSelectMode ? 2 : 0, borderColor: '#fff' }]}
              />
            ))}
          </View>
          <TouchableOpacity onPress={pickImage} style={styles.toolBtn}>
            <MaterialIcons name="add-photo-alternate" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleSelectMode} style={[styles.toolBtn, isSelectMode && styles.activeTool]}>
            <MaterialIcons name="select-all" size={24} color={isSelectMode ? "#000" : "#fff"} />
          </TouchableOpacity>
        </View>

        <View style={styles.canvasContainer}>
          <ViewShot ref={viewShotRef} style={styles.shotBoundary} options={{ format: 'png', quality: 1.0 }}>
            <View style={styles.canvas} {...panResponder.panHandlers}>
              <Svg height={CANVAS_HEIGHT} width={CANVAS_WIDTH}>
                {paths.map((path, i) => {
                  const meta = getPathMeta(path.d);
                  if (!meta) return null;
                  const isSelected = selectedPathIndex === i;
                  return (
                    <G key={i} transform={`translate(${path.translateX || 0}, ${path.translateY || 0}) rotate(${path.rotation}, ${meta.x}, ${meta.y}) translate(${meta.x}, ${meta.y}) scale(${path.scale}) translate(${-meta.x}, ${-meta.y})`}>
                      {path.type === 'image' ? (
                        <SvgImage href={path.uri} x={path.x} y={path.y} width={path.width} height={path.height} opacity={isSelected ? 0.7 : 1} />
                      ) : (
                        <Path d={path.d} fill="none" stroke={path.color} strokeWidth={path.width} strokeLinecap="round" opacity={path.opacity || (isSelected ? 0.7 : 1)} />
                      )}
                      {isSelected && isSelectMode && (
                        <G>
                          <Rect x={meta.minX - 10} y={meta.minY - 10} width={meta.width + 20} height={meta.height + 20} fill="none" stroke="#007AFF" strokeDasharray="5,5" />
                          <Circle cx={meta.x} cy={meta.minY - 40} r={15} fill="#ffd93d" onStartShouldSetResponder={() => true} onResponderMove={(e) => handleGestureTransform(e, 'rotate')} />
                          <Circle cx={meta.maxX + 15} cy={meta.maxY + 15} r={15} fill="#fff" stroke="#007AFF" strokeWidth="2" onStartShouldSetResponder={() => true} onResponderMove={(e) => handleGestureTransform(e, 'scale')} />
                        </G>
                      )}
                    </G>
                  );
                })}
                {currentPath.length > 0 && <Path d={currentPath.join(' ')} fill="none" stroke={isEraser ? '#16171d' : selectedColor} strokeWidth={isEraser ? 25 : (isHighlighter ? 18 : 4)} strokeLinecap="round" opacity={isHighlighter ? 0.4 : 1} />}
                {selectionBox && <Rect x={selectionBox.x} y={selectionBox.y} width={selectionBox.width} height={selectionBox.height} fill="rgba(0, 122, 255, 0.1)" stroke="#007AFF" strokeDasharray="4,4" />}
              </Svg>
            </View>
          </ViewShot>
        </View>

        <View style={styles.footer}>
          <View style={styles.undoRedoGroup}>
            <TouchableOpacity style={styles.footerBtn} onPress={undo} disabled={paths.length === 0}><MaterialIcons name="undo" size={26} color={paths.length === 0 ? "#555" : "#fff"} /></TouchableOpacity>
            <TouchableOpacity style={styles.footerBtn} onPress={redo} disabled={redoStack.length === 0}><MaterialIcons name="redo" size={26} color={redoStack.length === 0 ? "#555" : "#fff"} /></TouchableOpacity>
          </View>
          <TouchableOpacity onPress={toggleHighlighter} style={[styles.footerBtn, isHighlighter && styles.activeFooterBtn]}><Feather name="edit-2" size={24} color={isHighlighter ? "#000" : "#fff"} /></TouchableOpacity>
          <TouchableOpacity onPress={toggleEraser} style={[styles.footerBtn, isEraser && styles.activeFooterBtn]}><MaterialIcons name="auto-fix-high" size={26} color={isEraser ? "#000" : "#fff"} /></TouchableOpacity>
          <TouchableOpacity style={styles.insertBtn} onPress={async () => {
               const uri = await viewShotRef.current.capture();
               onInsert(uri, CANVAS_WIDTH, CANVAS_HEIGHT);
               onClose();
          }}><Text style={styles.insertBtnText}>Insert</Text></TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

// import { MaterialIcons } from '@expo/vector-icons';
// import React, { useMemo, useRef, useState } from 'react';
// import { Modal, PanResponder, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
// import Svg, { Circle, G, Path, Rect } from 'react-native-svg';
// import ViewShot from 'react-native-view-shot';

// // আপনার বিদ্যমান ইমপোর্টগুলো
// import { CANVAS_HEIGHT, CANVAS_WIDTH, styles } from './DrawingCanvas.style';
// import { COLORS, getPathMeta } from './DrawingUtils';

// export default function DrawingCanvas({ visible, onClose, onInsert }) {
//   const [paths, setPaths] = useState([]);
//   const [redoStack, setRedoStack] = useState([]);
//   const [currentPath, setCurrentPath] = useState([]);
//   const [selectedPathIndex, setSelectedPathIndex] = useState(null);
//   const [isSelectMode, setIsSelectMode] = useState(false);
//   const [selectionBox, setSelectionBox] = useState(null);
//   const [selectedColor, setSelectedColor] = useState('#fff');
//   const [isEraser, setIsEraser] = useState(false);
//   const [isTransforming, setIsTransforming] = useState(false);

//   const viewShotRef = useRef(null);
//   const moveOffset = useRef({ x: 0, y: 0 });

//   // টুল লজিক
//   const toggleSelectMode = () => {
//     setIsSelectMode(!isSelectMode);
//     setIsEraser(false);
//     setSelectedPathIndex(null);
//   };

//   const toggleEraser = () => {
//     setIsEraser(!isEraser);
//     setIsSelectMode(false);
//     setSelectedPathIndex(null);
//   };

//   const undo = () => {
//     if (paths.length > 0) {
//       const last = paths[paths.length - 1];
//       setRedoStack(p => [...p, last]);
//       setPaths(p => p.slice(0, -1));
//       setSelectedPathIndex(null);
//     }
//   };

//   const redo = () => {
//     if (redoStack.length > 0) {
//       const next = redoStack[redoStack.length - 1];
//       setPaths(p => [...p, next]);
//       setRedoStack(p => p.slice(0, -1));
//     }
//   };

//   const checkSelection = (box) => {
//     if (!box) return;
    
//     // সিঙ্গেল ট্যাপ হ্যান্ডলিং (যদি বক্স খুব ছোট হয়)
//     const isTap = box.width < 10 && box.height < 10;
//     const searchX = isTap ? box.startX : box.x;
//     const searchY = isTap ? box.startY : box.y;

//     const foundIndex = paths.findLastIndex((p) => {
//       const meta = getPathMeta(p.d);
//       if (!meta) return false;

//       // ট্রান্সফর্মেশন সহ বাউন্ডারি চেক (সহজ করার জন্য মেটা ডাটা ব্যবহার করা হয়েছে)
//       const x = meta.x + (p.translateX || 0);
//       const y = meta.y + (p.translateY || 0);
//       const w = meta.width * (p.scale || 1);
//       const h = meta.height * (p.scale || 1);

//       if (isTap) {
//         return searchX >= x - w/2 && searchX <= x + w/2 && searchY >= y - h/2 && searchY <= y + h/2;
//       }
      
//       return x >= box.x && x <= box.x + box.width && y >= box.y && y <= box.y + box.height;
//     });

//     setSelectedPathIndex(foundIndex !== -1 ? foundIndex : null);
//   };

//   const panResponder = useMemo(() => PanResponder.create({
//     onStartShouldSetPanResponder: () => true,
//     onPanResponderGrant: (evt) => {
//       const { locationX, locationY } = evt.nativeEvent;
      
//       if (isSelectMode) {
//         // যদি সিলেক্টেড অবজেক্টের ওপর ক্লিক করা হয় তবে মুভ মোড শুরু হবে
//         if (selectedPathIndex !== null) {
//           const target = paths[selectedPathIndex];
//           const meta = getPathMeta(target.d);
//           const objX = meta.x + (target.translateX || 0);
//           const objY = meta.y + (target.translateY || 0);
          
//           // চেক: ইউজারের টাচ কি অবজেক্টের আশেপাশে?
//           const dist = Math.sqrt(Math.pow(locationX - objX, 2) + Math.pow(locationY - objY, 2));
//           if (dist < 50) {
//             setIsTransforming(true);
//             moveOffset.current = { 
//               x: locationX - (target.translateX || 0), 
//               y: locationY - (target.translateY || 0) 
//             };
//             return;
//           }
//         }
//         setSelectionBox({ x: locationX, y: locationY, width: 0, height: 0, startX: locationX, startY: locationY });
//       } else {
//         setCurrentPath([`M${locationX.toFixed(1)} ${locationY.toFixed(1)}`]);
//       }
//     },
//     onPanResponderMove: (evt) => {
//       const { locationX, locationY } = evt.nativeEvent;
      
//       if (isSelectMode && isTransforming && selectedPathIndex !== null) {
//         // অবজেক্ট মুভমেন্ট লজিক
//         const newPaths = [...paths];
//         newPaths[selectedPathIndex].translateX = locationX - moveOffset.current.x;
//         newPaths[selectedPathIndex].translateY = locationY - moveOffset.current.y;
//         setPaths(newPaths);
//       } else if (isSelectMode && selectionBox) {
//         setSelectionBox(prev => ({
//           ...prev,
//           x: Math.min(locationX, prev.startX),
//           y: Math.min(locationY, prev.startY),
//           width: Math.abs(locationX - prev.startX),
//           height: Math.abs(locationY - prev.startY),
//         }));
//       } else if (!isSelectMode) {
//         setCurrentPath(prev => [...prev, `L${locationX.toFixed(1)} ${locationY.toFixed(1)}`]);
//       }
//     },
//     onPanResponderRelease: () => {
//       if (isSelectMode) {
//         if (!isTransforming && selectionBox) {
//           checkSelection(selectionBox);
//         }
//         setSelectionBox(null);
//         setIsTransforming(false);
//       } else if (currentPath.length > 0) {
//         setPaths(prev => [...prev, { 
//           d: currentPath.join(' '), 
//           color: isEraser ? '#16171d' : selectedColor, 
//           width: isEraser ? 25 : 2, 
//           rotation: 0, 
//           scale: 1,
//           translateX: 0,
//           translateY: 0
//         }]);
//         setCurrentPath([]);
//       }
//     },
//   }), [isSelectMode, paths, selectionBox, currentPath, selectedColor, isEraser, isTransforming, selectedPathIndex]);

//   const handleGestureTransform = (evt, type) => {
//     if (selectedPathIndex === null) return;
//     const { locationX, locationY } = evt.nativeEvent;
//     const newPaths = [...paths];
//     const target = newPaths[selectedPathIndex];
//     const meta = getPathMeta(target.d);
//     if (!meta) return;

//     const centerX = meta.x + (target.translateX || 0);
//     const centerY = meta.y + (target.translateY || 0);

//     if (type === 'rotate') {
//       const angle = Math.atan2(locationY - centerY, locationX - centerX) * (180 / Math.PI) + 90;
//       target.rotation = angle;
//     } else if (type === 'scale') {
//       const dist = Math.sqrt(Math.pow(locationX - centerX, 2) + Math.pow(locationY - centerY, 2));
//       const initialDist = Math.sqrt(Math.pow(meta.width / 2, 2) + Math.pow(meta.height / 2, 2));
//       target.scale = Math.max(0.3, Math.min(5.0, dist / initialDist));
//     }
//     setPaths(newPaths);
//   };

//   return (
//     <Modal visible={visible} animationType="slide">
//       <SafeAreaView style={styles.drawModal}>
//         <View style={styles.drawHeader}>
//           <TouchableOpacity onPress={onClose}><MaterialIcons name="close" size={28} color="#fff" /></TouchableOpacity>
//           <View style={styles.colorPalette}>
//             {COLORS.map(color => (
//               <TouchableOpacity key={color}
//                 onPress={() => { setSelectedColor(color); setIsEraser(false); setIsSelectMode(false); }}
//                 style={[styles.colorCircle, { backgroundColor: color, borderWidth: selectedColor === color && !isEraser && !isSelectMode ? 2 : 0, borderColor: '#fff' }]}
//               />
//             ))}
//           </View>
//           <TouchableOpacity onPress={toggleSelectMode} style={[styles.toolBtn, isSelectMode && styles.activeTool]}>
//             <MaterialIcons name="select-all" size={24} color={isSelectMode ? "#000" : "#fff"} />
//           </TouchableOpacity>
//         </View>

//         <View style={styles.canvasContainer}>
//           <ViewShot ref={viewShotRef} style={styles.shotBoundary} options={{ format: 'png', quality: 1.0 }}>
//             <View style={styles.canvas} {...panResponder.panHandlers}>
//               <Svg height={CANVAS_HEIGHT} width={CANVAS_WIDTH}>
//                 {paths.map((path, i) => {
//                   const meta = getPathMeta(path.d);
//                   if (!meta) return null;
//                   const isSelected = selectedPathIndex === i;
                  
//                   // ট্রান্সফর্মেশন ক্যালকুলেশন
//                   const tX = path.translateX || 0;
//                   const tY = path.translateY || 0;

//                   return (
//                     <G key={i} transform={`translate(${tX}, ${tY}) rotate(${path.rotation}, ${meta.x}, ${meta.y}) translate(${meta.x}, ${meta.y}) scale(${path.scale}) translate(${-meta.x}, ${-meta.y})`}>
//                       <Path d={path.d} fill="none" stroke={path.color} strokeWidth={path.width} strokeLinecap="round" opacity={isSelected ? 0.7 : 1} />
                      
//                       {isSelected && isSelectMode && (
//                         <G>
//                           {/* সীমানা বক্স */}
//                           <Rect x={meta.minX - 10} y={meta.minY - 10} width={meta.width + 20} height={meta.height + 20} fill="none" stroke="#007AFF" strokeDasharray="5,5" />
                          
//                           {/* Rotation Handle (Yellow) */}
//                           <Circle cx={meta.x} cy={meta.minY - 40} r={15} fill="#ffd93d"
//                             onStartShouldSetResponder={() => true}
//                             onResponderGrant={() => setIsTransforming(true)}
//                             onResponderMove={(e) => handleGestureTransform(e, 'rotate')}
//                             onResponderRelease={() => setIsTransforming(false)} />
                          
//                           {/* Scale Handle (White) */}
//                           <Circle cx={meta.maxX + 15} cy={meta.maxY + 15} r={15} fill="#fff" stroke="#007AFF" strokeWidth="2"
//                             onStartShouldSetResponder={() => true}
//                             onResponderGrant={() => setIsTransforming(true)}
//                             onResponderMove={(e) => handleGestureTransform(e, 'scale')}
//                             onResponderRelease={() => setIsTransforming(false)} />
//                         </G>
//                       )}
//                     </G>
//                   );
//                 })}
//                 {currentPath.length > 0 && <Path d={currentPath.join(' ')} fill="none" stroke={isEraser ? '#16171d' : selectedColor} strokeWidth={isEraser ? 25 : 4} strokeLinecap="round" />}
//                 {selectionBox && <Rect x={selectionBox.x} y={selectionBox.y} width={selectionBox.width} height={selectionBox.height} fill="rgba(0, 122, 255, 0.1)" stroke="#007AFF" strokeDasharray="4,4" />}
//               </Svg>
//             </View>
//           </ViewShot>
//         </View>

//         <View style={styles.footer}>
//           <View style={styles.undoRedoGroup}>
//             <TouchableOpacity style={styles.footerBtn} onPress={undo} disabled={paths.length === 0}>
//               <MaterialIcons name="undo" size={26} color={paths.length === 0 ? "#555" : "#fff"} />
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.footerBtn} onPress={redo} disabled={redoStack.length === 0}>
//               <MaterialIcons name="redo" size={26} color={redoStack.length === 0 ? "#555" : "#fff"} />
//             </TouchableOpacity>
//           </View>
          
//           <TouchableOpacity onPress={toggleEraser} style={[styles.footerBtn, isEraser && styles.activeFooterBtn]}>
//             <MaterialIcons name="auto-fix-high" size={26} color={isEraser ? "#000" : "#fff"} />
//           </TouchableOpacity>

//           {selectedPathIndex !== null && (
//             <TouchableOpacity style={styles.footerBtn} onPress={() => { setPaths(paths.filter((_, idx) => idx !== selectedPathIndex)); setSelectedPathIndex(null); }}>
//               <MaterialIcons name="delete" size={26} color="#ff5252" />
//             </TouchableOpacity>
//           )}

//           <TouchableOpacity style={styles.insertBtn} onPress={async () => {
//              const uri = await viewShotRef.current.capture();
//              onInsert(uri, CANVAS_WIDTH, CANVAS_HEIGHT);
//              onClose();
//           }}>
//             <Text style={styles.insertBtnText}>Insert</Text>
//           </TouchableOpacity>
//         </View>
//       </SafeAreaView>
//     </Modal>
//   );
// }