

import { Feather, MaterialIcons } from '@expo/vector-icons';
import * as ImageManipulator from 'expo-image-manipulator';
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
  const [selectedColor, setSelectedColor] = useState('#fff');
  const [isEraser, setIsEraser] = useState(false);
  const [isHighlighter, setIsHighlighter] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);

  const viewShotRef = useRef(null);
  const moveOffset = useRef({ x: 0, y: 0 });

  // --- লেয়ার ও হিস্ট্রি (Undo, Redo, Layers) ---
  const undo = () => {
    if (paths.length === 0) return;
    const last = paths[paths.length - 1];
    setRedoStack(p => [...p, last]);
    setPaths(p => p.slice(0, -1));
    setSelectedPathIndex(null);
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setPaths(p => [...p, next]);
    setRedoStack(p => p.slice(0, -1));
  };

  const bringToFront = () => {
    if (selectedPathIndex === null) return;
    const newPaths = [...paths];
    const item = newPaths.splice(selectedPathIndex, 1)[0];
    newPaths.push(item);
    setPaths(newPaths);
    setSelectedPathIndex(newPaths.length - 1);
  };

  const sendToBack = () => {
    if (selectedPathIndex === null) return;
    const newPaths = [...paths];
    const item = newPaths.splice(selectedPathIndex, 1)[0];
    newPaths.unshift(item);
    setPaths(newPaths);
    setSelectedPathIndex(0);
  };

  // // --- ইমেজ ইম্পোর্ট (স্মার্ট স্কেলিং ফিক্স) ---
  // const pickImage = async () => {
  //   let result = await ImagePicker.launchImageLibraryAsync({
  //     mediaTypes: ImagePicker.MediaTypeOptions.Images,
  //     allowsEditing: true, // ইউজারের প্রয়োজন হলে ক্রপ করতে পারবে
  //     quality: 1,

  //   });

  //   if (!result.canceled) {
  //     const { uri, width, height } = result.assets[0];
      
  //     // ১. ক্যানভাসে ইমেজের সর্বোচ্চ সাইজ নির্ধারণ (ক্যানভাসের ৭০% এর বেশি হবে না)
  //     const MAX_IMG_WIDTH = CANVAS_WIDTH * 0.7; 
  //     const MAX_IMG_HEIGHT = CANVAS_HEIGHT * 0.7;
      
  //     const aspectRatio = width / height;

  //     let displayWidth = width;
  //     let displayHeight = height;

  //     // ২. চওড়া ইমেজের জন্য স্কেলিং
  //     if (displayWidth > MAX_IMG_WIDTH) {
  //       displayWidth = MAX_IMG_WIDTH;
  //       displayHeight = displayWidth / aspectRatio;
  //     }

  //     // ৩. লম্বা (Tall) ইমেজের জন্য স্কেলিং - যা আপনার বর্তমান সমস্যা সমাধান করবে
  //     if (displayHeight > MAX_IMG_HEIGHT) {
  //       displayHeight = MAX_IMG_HEIGHT;
  //       displayWidth = displayHeight * aspectRatio;
  //     }

  //     // ৪. সেন্টার ক্যালকুলেশন
  //     const centerX = CANVAS_WIDTH / 2;
  //     const centerY = CANVAS_HEIGHT / 2;

  //     const newImageNode = {
  //       type: 'image',
  //       uri, 
  //       width: displayWidth, 
  //       height: displayHeight,
  //       x: centerX - displayWidth / 2, // একদম সেন্টারে বসবে
  //       y: centerY - displayHeight / 2,
  //       rotation: 0, 
  //       scale: 1, 
  //       translateX: 0, 
  //       translateY: 0,
  //     };
      
  //     // ৫. পাথ আপডেট এবং অটো-সিলেক্ট মোড অন করা
  //     setPaths(prev => [...prev, newImageNode]);
  //     setRedoStack([]);
  //     setSelectedPathIndex(paths.length); // নতুন ইমেজটি অটো সিলেক্ট হবে
  //     setIsSelectMode(true); // সিলেক্ট মোড অন হবে যাতে সাথে সাথে মুভ করা যায়
  //   }
  // };

  const pickImage = async () => {
  try {
    // --- ১. ImagePicker দিয়ে free crop enable ---
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, // ফ্রি ক্রপ
      quality: 1,
    });

    if (result.canceled) return;

    const { uri, width, height } = result.assets[0];

    // --- ২. ক্যানভাসে max size নির্ধারণ ---
    const MAX_IMG_WIDTH = CANVAS_WIDTH * 0.7;   // ক্যানভাসের 70%
    const MAX_IMG_HEIGHT = CANVAS_HEIGHT * 0.7; // ক্যানভাসের 70%
    
    let finalWidth = width;
    let finalHeight = height;
    const aspectRatio = width / height;

    // --- ৩. height constraint ---
    if (height > MAX_IMG_HEIGHT) {
      finalHeight = MAX_IMG_HEIGHT;
      finalWidth = finalHeight * aspectRatio;
    }

    // --- ৪. width constraint (optional, safety) ---
    if (finalWidth > MAX_IMG_WIDTH) {
      finalWidth = MAX_IMG_WIDTH;
      finalHeight = finalWidth / aspectRatio;
    }

    // --- ৫. ImageManipulator দিয়ে resize ---
    const manipulated = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: finalWidth, height: finalHeight } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );

    // --- ৬. canvas এ center করা ---
    const centerX = CANVAS_WIDTH / 2;
    const centerY = CANVAS_HEIGHT / 2;

    const newImageNode = {
      type: 'image',
      uri: manipulated.uri,
      width: finalWidth,
      height: finalHeight,
      x: centerX - finalWidth / 2,
      y: centerY - finalHeight / 2,
      rotation: 0,
      scale: 1,
      translateX: 0,
      translateY: 0,
    };

    // --- ৭. paths update + auto select ---
    setPaths(prev => [...prev, newImageNode]);
    setRedoStack([]);
    setSelectedPathIndex(paths.length); // নতুন ইমেজ auto select
    setIsSelectMode(true);              // select mode on

  } catch (e) {
    console.log('Pick image error:', e);
  }
};

  // --- নিখুঁত সিলেকশন চেক ---
  const checkSelection = (x, y) => {
    const foundIndex = paths.findLastIndex((p) => {
      let left, right, top, bottom;
      if (p.type === 'image') {
        const curW = p.width * p.scale;
        const curH = p.height * p.scale;
        const curX = p.x + p.translateX + (p.width - curW) / 2;
        const curY = p.y + p.translateY + (p.height - curH) / 2;
        left = curX; right = curX + curW; top = curY; bottom = curY + curH;
      } else {
        const meta = getPathMeta(p.d);
        if (!meta) return false;
        const curX = meta.x + p.translateX;
        const curY = meta.y + p.translateY;
        const curW = meta.width * p.scale;
        const curH = meta.height * p.scale;
        left = curX - curW / 2; right = curX + curW / 2; top = curY - curH / 2; bottom = curY + curH / 2;
      }
      return x >= left - 15 && x <= right + 15 && y >= top - 15 && y <= bottom + 15;
    });
    setSelectedPathIndex(foundIndex !== -1 ? foundIndex : null);
  };

  const handleGestureTransform = (evt, type) => {
    if (selectedPathIndex === null) return;
    const { locationX, locationY } = evt.nativeEvent;
    const newPaths = [...paths];
    const target = newPaths[selectedPathIndex];
    
    const cx = target.type === 'image' ? target.x + target.width/2 + target.translateX : getPathMeta(target.d).x + target.translateX;
    const cy = target.type === 'image' ? target.y + target.height/2 + target.translateY : getPathMeta(target.d).y + target.translateY;

    if (type === 'rotate') {
      target.rotation = Math.atan2(locationY - cy, locationX - cx) * (180 / Math.PI) + 90;
    } else if (type === 'scale') {
      const dist = Math.sqrt(Math.pow(locationX - cx, 2) + Math.pow(locationY - cy, 2));
      target.scale = Math.max(0.3, dist / 100); 
    }
    setPaths(newPaths);
  };

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      if (isSelectMode) {
        checkSelection(locationX, locationY);
        if (selectedPathIndex !== null) {
          setIsTransforming(true);
          const target = paths[selectedPathIndex];
          moveOffset.current = { x: locationX - target.translateX, y: locationY - target.translateY };
        }
      } else {
        const startPoint = `M${locationX.toFixed(1)} ${locationY.toFixed(1)}`;
        setCurrentPath([startPoint]);
      }
    },
    onPanResponderMove: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      if (isSelectMode && isTransforming && selectedPathIndex !== null) {
        const newPaths = [...paths];
        newPaths[selectedPathIndex].translateX = locationX - moveOffset.current.x;
        newPaths[selectedPathIndex].translateY = locationY - moveOffset.current.y;
        setPaths(newPaths);
      } else if (!isSelectMode) {
        setCurrentPath(prev => [...prev, `L${locationX.toFixed(1)} ${locationY.toFixed(1)}`]);
      }
    },
    onPanResponderRelease: () => {
      setIsTransforming(false);
      if (!isSelectMode && currentPath.length > 0) {
        setPaths(prev => [...prev, { 
          d: currentPath.join(' '), 
          color: isEraser ? '#16171d' : selectedColor, 
          width: isEraser ? 25 : (isHighlighter ? 18 : 4), 
          opacity: isHighlighter ? 0.4 : 1,
          rotation: 0, scale: 1, translateX: 0, translateY: 0
        }]);
        setCurrentPath([]);
        setRedoStack([]);
      }
    },
  }), [isSelectMode, paths, currentPath, selectedPathIndex, isEraser, isHighlighter, isTransforming, selectedColor]);

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={styles.drawModal}>
        {/* Header - Tools */}
        <View style={styles.drawHeader}>
          <TouchableOpacity onPress={onClose}><MaterialIcons name="close" size={28} color="#fff" /></TouchableOpacity>
          <View style={styles.colorPalette}>
            {COLORS.map(color => (
              <TouchableOpacity key={color} onPress={() => { setSelectedColor(color); setIsEraser(false); setIsSelectMode(false); }}
                style={[styles.colorCircle, { backgroundColor: color, borderWidth: selectedColor === color && !isEraser ? 2 : 0, borderColor: '#fff' }]} />
            ))}
          </View>
          <TouchableOpacity onPress={pickImage} style={styles.toolBtn}><MaterialIcons name="add-a-photo" size={24} color="#fff" /></TouchableOpacity>
          <TouchableOpacity onPress={() => setIsSelectMode(!isSelectMode)} style={[styles.toolBtn, isSelectMode && styles.activeTool]}>
            <MaterialIcons name="select-all" size={24} color={isSelectMode ? "#000" : "#fff"} />
          </TouchableOpacity>
        </View>

        {/* Layer Controls - (Front, Back, Delete) */}
        {isSelectMode && selectedPathIndex !== null && (
          <View style={styles.layerControlBar}>
            <TouchableOpacity style={styles.layerBtn} onPress={bringToFront}><MaterialIcons name="flip-to-front" size={20} color="#fff" /><Text style={styles.layerBtnText}>Front</Text></TouchableOpacity>
            <TouchableOpacity style={styles.layerBtn} onPress={sendToBack}><MaterialIcons name="flip-to-back" size={20} color="#fff" /><Text style={styles.layerBtnText}>Back</Text></TouchableOpacity>
            <TouchableOpacity style={styles.layerBtn} onPress={() => { setPaths(paths.filter((_, i) => i !== selectedPathIndex)); setSelectedPathIndex(null); }}><MaterialIcons name="delete" size={20} color="#ff5252" /><Text style={[styles.layerBtnText, {color: '#ff5252'}]}>Delete</Text></TouchableOpacity>
          </View>
        )}

        {/* Canvas Area */}
        <View style={styles.canvasContainer}>
          <ViewShot ref={viewShotRef} style={styles.shotBoundary}>
            <View style={styles.canvas} {...panResponder.panHandlers}>
              <Svg height={CANVAS_HEIGHT} width={CANVAS_WIDTH}>
                {paths.map((path, i) => {
                  const isSelected = selectedPathIndex === i && isSelectMode;
                  const meta = path.type === 'image' ? { x: path.x + path.width/2, y: path.y + path.height/2, minX: path.x, minY: path.y, width: path.width, height: path.height, maxX: path.x + path.width, maxY: path.y + path.height } : getPathMeta(path.d);
                  
                  return (
                    <G key={i} transform={`translate(${path.translateX}, ${path.translateY}) rotate(${path.rotation}, ${meta.x}, ${meta.y}) translate(${meta.x}, ${meta.y}) scale(${path.scale}) translate(${-meta.x}, ${-meta.y})`}>
                      {path.type === 'image' ? (
                        <SvgImage href={path.uri} x={path.x} y={path.y} width={path.width} height={path.height} />
                      ) : (
                        <Path d={path.d} fill="none" stroke={path.color} strokeWidth={path.width} strokeLinecap="round" opacity={path.opacity} />
                      )}
                      {isSelected && (
                        <G>
                          <Rect x={meta.minX - 5} y={meta.minY - 5} width={meta.width + 10} height={meta.height + 10} fill="none" stroke="#007AFF" strokeDasharray="5,5" />
                          <Circle cx={meta.x} cy={meta.minY - 45} r={22} fill="#ffd93d" onStartShouldSetResponder={() => true} onResponderMove={(e) => handleGestureTransform(e, 'rotate')} />
                          <Circle cx={meta.maxX + 15} cy={meta.maxY + 15} r={22} fill="#fff" stroke="#007AFF" strokeWidth="2" onStartShouldSetResponder={() => true} onResponderMove={(e) => handleGestureTransform(e, 'scale')} />
                        </G>
                      )}
                    </G>
                  );
                })}
                {currentPath.length > 0 && <Path d={currentPath.join(' ')} fill="none" stroke={isEraser ? '#16171d' : selectedColor} strokeWidth={isEraser ? 25 : (isHighlighter ? 18 : 4)} strokeLinecap="round" opacity={isHighlighter ? 0.4 : 1} />}
              </Svg>
            </View>
          </ViewShot>
        </View>

        {/* Footer - Undo, Redo, Highlighter, Insert */}
        <View style={styles.footer}>
          <View style={styles.undoRedoGroup}>
            <TouchableOpacity style={styles.footerBtn} onPress={undo} disabled={paths.length === 0}>
               <MaterialIcons name="undo" size={26} color={paths.length === 0 ? "#555" : "#fff"} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.footerBtn} onPress={redo} disabled={redoStack.length === 0}>
               <MaterialIcons name="redo" size={26} color={redoStack.length === 0 ? "#555" : "#fff"} />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity onPress={() => { setIsHighlighter(!isHighlighter); setIsEraser(false); }} style={[styles.footerBtn, isHighlighter && styles.activeFooterBtn]}>
             <Feather name="edit-2" size={24} color={isHighlighter ? "#b7c7ff" : "#fff"} />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => { setIsEraser(!isEraser); setIsHighlighter(false); }} style={[styles.footerBtn, isEraser && styles.activeFooterBtn]}>
             <MaterialIcons name="auto-fix-high" size={26} color={isEraser ? "#b7c7ff" : "#fff"} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.insertBtn} onPress={async () => {
      // ১. ক্যাপচার করার আগে সিলেকশন হাইড করে দিন
      setSelectedPathIndex(null);
      setIsSelectMode(false);

      // ২. স্টেট আপডেট হওয়ার জন্য সামান্য সময় দিন (অত্যন্ত দ্রুত কাজ করে)
      // রিয়াক্ট নেটিভের স্টেট আপডেট হতে যে সময় লাগে তার জন্য requestAnimationFrame ব্যবহার করা ভালো
      requestAnimationFrame(async () => {
        try {
          const uri = await viewShotRef.current.capture();
          onInsert(uri, CANVAS_WIDTH, CANVAS_HEIGHT);
          onClose();
        } catch (error) {
          console.error("Capture failed:", error);
        }
      });
    }}><Text style={styles.insertBtnText}>Insert</Text></TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}