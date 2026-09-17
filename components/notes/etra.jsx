// // // // // // // // DrawingCanvas.jsx
// // // // // // import { MaterialIcons } from '@expo/vector-icons';
// // // // // // import React, { useMemo, useRef, useState } from 'react';
// // // // // // import {
// // // // // //   Dimensions,
// // // // // //   Modal,
// // // // // //   PanResponder,
// // // // // //   SafeAreaView,
// // // // // //   StyleSheet,
// // // // // //   Text,
// // // // // //   TouchableOpacity,
// // // // // //   View
// // // // // // } from 'react-native';
// // // // // // import Svg, { Path } from 'react-native-svg';
// // // // // // import ViewShot from 'react-native-view-shot';

// // // // // // const { width, height } = Dimensions.get('window');
// // // // // // const COLORS = ['#fff', '#b7c7ff', '#ff6b6b', '#ffd93d', '#6bffbc', '#ff9ff3'];

// // // // // // export default function DrawingCanvas({ visible, onClose, onInsert }) {
// // // // // //   const [paths, setPaths] = useState([]);
// // // // // //   const [currentPath, setCurrentPath] = useState([]);
// // // // // //   const [selectedColor, setSelectedColor] = useState('#fff');
// // // // // //   const [isEraser, setIsEraser] = useState(false);
  
// // // // // //   const viewShotRef = useRef(null);

// // // // // //   const panResponder = useMemo(() => PanResponder.create({
// // // // // //     onStartShouldSetPanResponder: () => true,
// // // // // //     onMoveShouldSetPanResponder: () => true,
// // // // // //     onPanResponderGrant: (evt) => {
// // // // // //       const { locationX, locationY } = evt.nativeEvent;
// // // // // //       setCurrentPath([`M${locationX.toFixed(1)} ${locationY.toFixed(1)}`]);
// // // // // //     },
// // // // // //     onPanResponderMove: (evt) => {
// // // // // //       const { locationX, locationY } = evt.nativeEvent;
// // // // // //       const newPoint = `L${locationX.toFixed(1)} ${locationY.toFixed(1)}`;
// // // // // //       setCurrentPath((prev) => [...prev, newPoint]);
// // // // // //     },
// // // // // //     onPanResponderRelease: () => {
// // // // // //       setCurrentPath((prev) => {
// // // // // //         if (prev.length > 0) {
// // // // // //           const fullPath = prev.join(' ');
// // // // // //           setPaths((allPaths) => [...allPaths, { 
// // // // // //             d: fullPath, 
// // // // // //             color: isEraser ? '#000' : selectedColor, 
// // // // // //             width: isEraser ? 20 : 4 
// // // // // //           }]);
// // // // // //         }
// // // // // //         return [];
// // // // // //       });
// // // // // //     },
// // // // // //   }), [selectedColor, isEraser]);

// // // // // //   const handleInsert = async () => {
// // // // // //     if (paths.length === 0) {
// // // // // //       onClose();
// // // // // //       return;
// // // // // //     }

// // // // // //     try {
// // // // // //       // ইমেজ ক্যাপচার করে টেম্পোরারি ফাইল পাথ নেওয়া
// // // // // //       const uri = await viewShotRef.current.capture();
      
// // // // // //       const canvasWidth = 300;
// // // // // //       const canvasHeight = 169;

// // // // // //       // মেইন এডিটরে ইমেজ পাথ এবং সাইজ পাঠানো
// // // // // //       onInsert(uri, canvasWidth, canvasHeight); 
// // // // // //       setPaths([]); 
// // // // // //     } catch (error) {
// // // // // //       console.error("Capture failed:", error);
// // // // // //     }
// // // // // //   };

// // // // // //   return (
// // // // // //     <Modal visible={visible} animationType="slide">
// // // // // //       <SafeAreaView style={styles.drawModal}>
// // // // // //         <View style={styles.drawHeader}>
// // // // // //           <TouchableOpacity onPress={onClose}><Text style={{color: '#fff'}}>Cancel</Text></TouchableOpacity>
// // // // // //           <View style={styles.colorPalette}>
// // // // // //             {COLORS.map(color => (
// // // // // //               <TouchableOpacity 
// // // // // //                 key={color} 
// // // // // //                 onPress={() => {setSelectedColor(color); setIsEraser(false);}}
// // // // // //                 style={[
// // // // // //                   styles.colorCircle, 
// // // // // //                   {
// // // // // //                     backgroundColor: color, 
// // // // // //                     borderWidth: selectedColor === color && !isEraser ? 2 : 1, 
// // // // // //                     borderColor: '#fff'
// // // // // //                   }
// // // // // //                 ]} 
// // // // // //               />
// // // // // //             ))}
// // // // // //             <TouchableOpacity 
// // // // // //               onPress={() => setIsEraser(true)}
// // // // // //               style={[styles.eraserBtn, {backgroundColor: isEraser ? '#fff' : '#0f1014'}]}
// // // // // //             >
// // // // // //               <MaterialIcons name="auto-fix-high" size={18} color={isEraser ? '#000' : '#fff'} />
// // // // // //             </TouchableOpacity>
// // // // // //           </View>
// // // // // //           <TouchableOpacity onPress={() => setPaths([])}><MaterialIcons name="delete" size={24} color="#ff6b6b" /></TouchableOpacity>
// // // // // //         </View>
        
// // // // // //         <ViewShot 
// // // // // //           ref={viewShotRef} 
// // // // // //           options={{ format: "png", quality: 1.0 }} 
// // // // // //           style={styles.canvasContainer}
// // // // // //         >
// // // // // //           <View style={styles.canvas} {...panResponder.panHandlers}>
// // // // // //             <Svg height="100%" width="100%">
// // // // // //               {paths.map((path, i) => (
// // // // // //                 <Path key={`path-${i}`} d={path.d} fill="none" stroke={path.color} strokeWidth={path.width} strokeLinecap="round" strokeLinejoin="round" />
// // // // // //               ))}
// // // // // //               {currentPath.length > 0 && (
// // // // // //                 <Path d={currentPath.join(' ')} fill="none" stroke={isEraser ? '#444' : selectedColor} strokeWidth={isEraser ? 20 : 4} strokeLinecap="round" />
// // // // // //               )}
// // // // // //             </Svg>
// // // // // //           </View>
// // // // // //         </ViewShot>

// // // // // //         <TouchableOpacity style={styles.insertBtn} onPress={handleInsert}>
// // // // // //             <Text style={{fontWeight: 'bold', color: '#000'}}>Insert Drawing</Text>
// // // // // //         </TouchableOpacity>
// // // // // //       </SafeAreaView>
// // // // // //     </Modal>
// // // // // //   );
// // // // // // }

// // // // // // const styles = StyleSheet.create({
// // // // // //   drawModal: { flex: 1, backgroundColor: '#0f1014' },
// // // // // //   drawHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, alignItems: 'center' },
// // // // // //   colorPalette: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#222', padding: 8, borderRadius: 25 },
// // // // // //   colorCircle: { width: 22, height: 22, borderRadius: 11, marginHorizontal: 6 },
// // // // // //   eraserBtn: { padding: 5, borderRadius: 15, marginLeft: 10 },
// // // // // //   canvasContainer: { flex: 1, marginHorizontal: 10, borderRadius: 15, overflow: 'hidden' },
// // // // // //   canvas: { flex: 1, backgroundColor: '#000' }, 
// // // // // //   insertBtn: { backgroundColor: '#b7c7ff', padding: 15, margin: 20, borderRadius: 30, alignItems: 'center' }
// // // // // // });

// // // // // import { MaterialIcons } from '@expo/vector-icons';
// // // // // import React, { useMemo, useRef, useState } from 'react';
// // // // // import {
// // // // //   Dimensions,
// // // // //   Modal,
// // // // //   PanResponder,
// // // // //   SafeAreaView,
// // // // //   StyleSheet,
// // // // //   Text,
// // // // //   TouchableOpacity,
// // // // //   View,
// // // // // } from 'react-native';
// // // // // import Svg, { G, Path, Rect } from 'react-native-svg';
// // // // // import ViewShot from 'react-native-view-shot';

// // // // // const { width: windowWidth } = Dimensions.get('window');
// // // // // const COLORS = ['#fff', '#b7c7ff', '#ff6b6b', '#ffd93d', '#6bffbc', '#ff9ff3'];

// // // // // const CANVAS_WIDTH = windowWidth - 20;
// // // // // const CANVAS_HEIGHT = (CANVAS_WIDTH * 9) / 16;

// // // // // export default function DrawingCanvas({ visible, onClose, onInsert }) {
// // // // //   const [paths, setPaths] = useState([]);
// // // // //   const [currentPath, setCurrentPath] = useState([]);
// // // // //   const [selectedPathIndex, setSelectedPathIndex] = useState(null);
  
// // // // //   const [selectedColor, setSelectedColor] = useState('#fff');
// // // // //   const [isEraser, setIsEraser] = useState(false);
// // // // //   const [zoomScale, setZoomScale] = useState(1);
// // // // //   const [isSelectMode, setIsSelectMode] = useState(false);
// // // // //   const [selectionBox, setSelectionBox] = useState(null);

// // // // //   const viewShotRef = useRef(null);

// // // // //   // --- উন্নত সিলেকশন লজিক (পাথের সব পয়েন্ট চেক করা) ---
// // // // //   const checkSelection = (box) => {
// // // // //     if (!box || box.width < 5) return;

// // // // //     const foundIndex = paths.findIndex((pathObj) => {
// // // // //       // পাথের স্ট্রিং থেকে সব পয়েন্ট বের করা (M10 20 L30 40...)
// // // // //       const points = pathObj.d.replace(/[ML]/g, '').split(' ');
      
// // // // //       for (let i = 0; i < points.length; i += 2) {
// // // // //         const px = parseFloat(points[i]);
// // // // //         const py = parseFloat(points[i+1]);

// // // // //         // যদি পাথের যেকোনো একটি পয়েন্ট বক্সের ভেতরে থাকে
// // // // //         if (px >= box.x && px <= box.x + box.width && 
// // // // //             py >= box.y && py <= box.y + box.height) {
// // // // //           return true;
// // // // //         }
// // // // //       }
// // // // //       return false;
// // // // //     });

// // // // //     if (foundIndex !== -1) {
// // // // //       setSelectedPathIndex(foundIndex);
// // // // //     }
// // // // //   };

// // // // //   const panResponder = useMemo(() => PanResponder.create({
// // // // //     onStartShouldSetPanResponder: () => true,
// // // // //     onMoveShouldSetPanResponder: () => true,
// // // // //     onPanResponderGrant: (evt) => {
// // // // //       const { locationX, locationY } = evt.nativeEvent;
// // // // //       const adjX = locationX / zoomScale;
// // // // //       const adjY = locationY / zoomScale;

// // // // //       if (isSelectMode) {
// // // // //         setSelectedPathIndex(null);
// // // // //         setSelectionBox({ x: adjX, y: adjY, width: 0, height: 0, startX: adjX, startY: adjY });
// // // // //       } else {
// // // // //         setCurrentPath([`M${adjX.toFixed(1)} ${adjY.toFixed(1)}`]);
// // // // //       }
// // // // //     },
// // // // //     onPanResponderMove: (evt) => {
// // // // //       const { locationX, locationY } = evt.nativeEvent;
// // // // //       const adjX = locationX / zoomScale;
// // // // //       const adjY = locationY / zoomScale;

// // // // //       if (isSelectMode && selectionBox) {
// // // // //         setSelectionBox(prev => ({
// // // // //           ...prev,
// // // // //           x: Math.min(adjX, prev.startX),
// // // // //           y: Math.min(adjY, prev.startY),
// // // // //           width: Math.abs(adjX - prev.startX),
// // // // //           height: Math.abs(adjY - prev.startY),
// // // // //         }));
// // // // //       } else if (!isSelectMode) {
// // // // //         const newPoint = `L${adjX.toFixed(1)} ${adjY.toFixed(1)}`;
// // // // //         setCurrentPath((prev) => [...prev, newPoint]);
// // // // //       }
// // // // //     },
// // // // //     onPanResponderRelease: () => {
// // // // //       if (isSelectMode && selectionBox) {
// // // // //         checkSelection(selectionBox);
// // // // //         setSelectionBox(null);
// // // // //       } else if (!isSelectMode && currentPath.length > 0) {
// // // // //         setPaths(prev => [...prev, { 
// // // // //           d: currentPath.join(' '), 
// // // // //           color: isEraser ? '#16171d' : selectedColor, 
// // // // //           width: isEraser ? 25 : 4,
// // // // //           rotation: 0, scale: 1
// // // // //         }]);
// // // // //         setCurrentPath([]);
// // // // //       }
// // // // //     },
// // // // //   }), [isSelectMode, zoomScale, paths, selectionBox, currentPath, selectedColor, isEraser]);

// // // // //   // রোটেশন ও স্কেল
// // // // //   const transformSelected = (type) => {
// // // // //     if (selectedPathIndex === null) return;
// // // // //     const newPaths = [...paths];
// // // // //     if (type === 'rotate') newPaths[selectedPathIndex].rotation += 15;
// // // // //     if (type === 'plus') newPaths[selectedPathIndex].scale += 0.1;
// // // // //     if (type === 'minus') newPaths[selectedPathIndex].scale = Math.max(0.1, newPaths[selectedPathIndex].scale - 0.1);
// // // // //     setPaths(newPaths);
// // // // //   };

// // // // //   return (
// // // // //     <Modal visible={visible} animationType="slide">
// // // // //       <SafeAreaView style={styles.drawModal}>
        
// // // // //         <View style={styles.drawHeader}>
// // // // //           <TouchableOpacity onPress={onClose}><MaterialIcons name="close" size={28} color="#fff" /></TouchableOpacity>
          
// // // // //           <View style={styles.colorPalette}>
// // // // //             {COLORS.map(color => (
// // // // //               <TouchableOpacity 
// // // // //                 key={color} 
// // // // //                 onPress={() => {setSelectedColor(color); setIsEraser(false); setIsSelectMode(false);}}
// // // // //                 style={[styles.colorCircle, { backgroundColor: color, borderWidth: selectedColor === color && !isEraser ? 2 : 0, borderColor: '#fff' }]} 
// // // // //               />
// // // // //             ))}
// // // // //           </View>

// // // // //           <View style={styles.actionTools}>
// // // // //             <TouchableOpacity onPress={() => setZoomScale(prev => prev === 1 ? 2.5 : 1)} style={[styles.toolBtn, zoomScale > 1 && styles.activeTool]}>
// // // // //                <MaterialIcons name={zoomScale > 1 ? "zoom-out" : "zoom-in"} size={24} color={zoomScale > 1 ? "#000" : "#fff"} />
// // // // //             </TouchableOpacity>
// // // // //             <TouchableOpacity onPress={() => {setIsSelectMode(!isSelectMode); setSelectedPathIndex(null);}} style={[styles.toolBtn, isSelectMode && styles.activeTool]}>
// // // // //                <MaterialIcons name="select-all" size={24} color={isSelectMode ? "#000" : "#fff"} />
// // // // //             </TouchableOpacity>
// // // // //           </View>
// // // // //         </View>

// // // // //         <View style={styles.canvasContainer}>
// // // // //           <ViewShot ref={viewShotRef} style={styles.shotBoundary}>
// // // // //             <View style={[styles.canvas, { transform: [{ scale: zoomScale }] }]} {...panResponder.panHandlers}>
// // // // //               <Svg height={CANVAS_HEIGHT} width={CANVAS_WIDTH}>
// // // // //                 {paths.map((path, i) => (
// // // // //                   <G key={i} transform={`rotate(${path.rotation}, ${CANVAS_WIDTH/2}, ${CANVAS_HEIGHT/2}) scale(${path.scale})`}>
// // // // //                     <Path d={path.d} fill="none" stroke={path.color} strokeWidth={path.width} strokeLinecap="round" 
// // // // //                       opacity={selectedPathIndex === i ? 0.4 : 1}
// // // // //                       strokeDasharray={selectedPathIndex === i ? "5,5" : "0"} // সিলেক্ট হলে ড্যাশ দেখাবে
// // // // //                     />
// // // // //                   </G>
// // // // //                 ))}
                
// // // // //                 {currentPath.length > 0 && <Path d={currentPath.join(' ')} fill="none" stroke={isEraser ? '#16171d' : selectedColor} strokeWidth={isEraser ? 25 : 4} strokeLinecap="round" />}
                
// // // // //                 {selectionBox && (
// // // // //                   <Rect x={selectionBox.x} y={selectionBox.y} width={selectionBox.width} height={selectionBox.height} fill="rgba(183, 199, 255, 0.2)" stroke="#b7c7ff" strokeWidth="1" strokeDasharray="4,4" />
// // // // //                 )}
// // // // //               </Svg>
// // // // //             </View>
// // // // //           </ViewShot>

// // // // //           {/* ট্রান্সফর্ম বক্স */}
// // // // //           {selectedPathIndex !== null && (
// // // // //             <View style={styles.transformBox}>
// // // // //               <TouchableOpacity onPress={() => transformSelected('minus')} style={styles.miniBtn}><MaterialIcons name="remove" size={20} color="#fff" /></TouchableOpacity>
// // // // //               <TouchableOpacity onPress={() => transformSelected('rotate')} style={styles.miniBtn}><MaterialIcons name="rotate-right" size={20} color="#fff" /></TouchableOpacity>
// // // // //               <TouchableOpacity onPress={() => transformSelected('plus')} style={styles.miniBtn}><MaterialIcons name="add" size={20} color="#fff" /></TouchableOpacity>
// // // // //               <TouchableOpacity onPress={() => {
// // // // //                 setPaths(paths.filter((_, idx) => idx !== selectedPathIndex));
// // // // //                 setSelectedPathIndex(null);
// // // // //               }} style={[styles.miniBtn, {backgroundColor: '#ff6b6b'}]}><MaterialIcons name="delete" size={20} color="#fff" /></TouchableOpacity>
// // // // //             </View>
// // // // //           )}
// // // // //         </View>

// // // // //         <View style={styles.footer}>
// // // // //           <TouchableOpacity style={styles.footerBtn} onPress={() => setPaths(paths.slice(0, -1))}><MaterialIcons name="undo" size={26} color="#fff" /></TouchableOpacity>
// // // // //           <TouchableOpacity onPress={() => setIsEraser(!isEraser)} style={[styles.footerBtn, isEraser && styles.activeFooterBtn]}><MaterialIcons name="auto-fix-high" size={26} color={isEraser ? "#000" : "#fff"} /></TouchableOpacity>
// // // // //           <TouchableOpacity style={styles.insertBtn} onPress={async () => onInsert(await viewShotRef.current.capture(), CANVAS_WIDTH, CANVAS_HEIGHT)}>
// // // // //             <Text style={styles.insertBtnText}>Insert</Text>
// // // // //           </TouchableOpacity>
// // // // //         </View>
// // // // //       </SafeAreaView>
// // // // //     </Modal>
// // // // //   );
// // // // // }

// // // // // const styles = StyleSheet.create({
// // // // //   drawModal: { flex: 1, backgroundColor: '#0f1014' },
// // // // //   drawHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, alignItems: 'center', backgroundColor: '#16171d' },
// // // // //   colorPalette: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f1014', padding: 8, borderRadius: 25 },
// // // // //   colorCircle: { width: 18, height: 18, borderRadius: 9, marginHorizontal: 5 },
// // // // //   actionTools: { flexDirection: 'row', gap: 10 },
// // // // //   toolBtn: { padding: 8, borderRadius: 10, backgroundColor: '#25262b' },
// // // // //   activeTool: { backgroundColor: '#b7c7ff' },
// // // // //   canvasContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
// // // // //   shotBoundary: { width: CANVAS_WIDTH, height: CANVAS_HEIGHT, overflow: 'hidden' },
// // // // //   canvas: { width: CANVAS_WIDTH, height: CANVAS_HEIGHT, backgroundColor: '#16171d' },
// // // // //   transformBox: { position: 'absolute', bottom: 20, flexDirection: 'row', backgroundColor: '#25262b', padding: 10, borderRadius: 30, gap: 15 },
// // // // //   miniBtn: { width: 35, height: 35, borderRadius: 20, backgroundColor: '#444', justifyContent: 'center', alignItems: 'center' },
// // // // //   footer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 15, backgroundColor: '#16171d' },
// // // // //   footerBtn: { padding: 10, borderRadius: 15, backgroundColor: '#25262b' },
// // // // //   activeFooterBtn: { backgroundColor: '#b7c7ff' },
// // // // //   insertBtn: { backgroundColor: '#b7c7ff', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 30 },
// // // // //   insertBtnText: { fontWeight: 'bold', color: '#000' }
// // // // // });



// // // //DrawingCanvas.jsx
// // // import { MaterialIcons } from '@expo/vector-icons';
// // // import React, { useMemo, useRef, useState } from 'react';
// // // import {
// // //   Dimensions,
// // //   Modal,
// // //   PanResponder,
// // //   SafeAreaView,
// // //   StyleSheet,
// // //   Text,
// // //   TouchableOpacity,
// // //   View,
// // // } from 'react-native';
// // // import Svg, { G, Path, Rect } from 'react-native-svg';
// // // import ViewShot from 'react-native-view-shot';

// // // const { width: windowWidth } = Dimensions.get('window');
// // // const COLORS = ['#fff', '#b7c7ff', '#ff6b6b', '#ffd93d', '#6bffbc', '#ff9ff3'];

// // // const CANVAS_WIDTH = windowWidth - 20;
// // // const CANVAS_HEIGHT = (CANVAS_WIDTH * 9) / 16;

// // // export default function DrawingCanvas({ visible, onClose, onInsert }) {
// // //   const [paths, setPaths] = useState([]); // [{d, color, width, rotation, scale, centerX, centerY}]
// // //   const [currentPath, setCurrentPath] = useState([]);
// // //   const [selectedPathIndex, setSelectedPathIndex] = useState(null);
// // //   const [isSelectMode, setIsSelectMode] = useState(false);
// // //   const [selectionBox, setSelectionBox] = useState(null);
// // //   const [selectedColor, setSelectedColor] = useState('#fff');
// // //   const [isEraser, setIsEraser] = useState(false);
// // //   const [zoomScale, setZoomScale] = useState(1);

// // //   const viewShotRef = useRef(null);

// // //   // পাথের সেন্টার বা অরিজিন বের করার ফাংশন
// // //   const getPathCenter = (pathData) => {
// // //     const points = pathData.replace(/[ML]/g, '').trim().split(/\s+/);
// // //     let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
// // //     for (let i = 0; i < points.length; i += 2) {
// // //       const x = parseFloat(points[i]);
// // //       const y = parseFloat(points[i + 1]);
// // //       if (x < minX) minX = x; if (x > maxX) maxX = x;
// // //       if (y < minY) minY = y; if (y > maxY) maxY = y;
// // //     }
// // //     return { x: (minX + maxX) / 2, y: (minY + maxY) / 2, minX, minY, maxX, maxY };
// // //   };

// // //   const checkSelection = (box) => {
// // //     if (!box || box.width < 5) return;
// // //     const foundIndex = paths.findIndex((p) => {
// // //       const center = getPathCenter(p.d);
// // //       return (
// // //         center.x >= box.x && center.x <= box.x + box.width &&
// // //         center.y >= box.y && center.y <= box.y + box.height
// // //       );
// // //     });
// // //     setSelectedPathIndex(foundIndex !== -1 ? foundIndex : null);
// // //   };

// // //   const panResponder = useMemo(() => PanResponder.create({
// // //     onStartShouldSetPanResponder: () => true,
// // //     onMoveShouldSetPanResponder: () => true,
// // //     onPanResponderGrant: (evt) => {
// // //       const { locationX, locationY } = evt.nativeEvent;
// // //       const adjX = locationX / zoomScale;
// // //       const adjY = locationY / zoomScale;

// // //       if (isSelectMode) {
// // //         setSelectionBox({ x: adjX, y: adjY, width: 0, height: 0, startX: adjX, startY: adjY });
// // //         setSelectedPathIndex(null);
// // //       } else {
// // //         setCurrentPath([`M${adjX.toFixed(1)} ${adjY.toFixed(1)}`]);
// // //       }
// // //     },
// // //     onPanResponderMove: (evt) => {
// // //       const { locationX, locationY } = evt.nativeEvent;
// // //       const adjX = locationX / zoomScale;
// // //       const adjY = locationY / zoomScale;

// // //       if (isSelectMode && selectionBox) {
// // //         setSelectionBox(prev => ({
// // //           ...prev,
// // //           x: Math.min(adjX, prev.startX),
// // //           y: Math.min(adjY, prev.startY),
// // //           width: Math.abs(adjX - prev.startX),
// // //           height: Math.abs(adjY - prev.startY),
// // //         }));
// // //       } else if (!isSelectMode) {
// // //         setCurrentPath(prev => [...prev, `L${adjX.toFixed(1)} ${adjY.toFixed(1)}`]);
// // //       }
// // //     },
// // //     onPanResponderRelease: () => {
// // //       if (isSelectMode && selectionBox) {
// // //         checkSelection(selectionBox);
// // //         setSelectionBox(null);
// // //       } else if (!isSelectMode && currentPath.length > 0) {
// // //         const d = currentPath.join(' ');
// // //         const center = getPathCenter(d);
// // //         setPaths(prev => [...prev, { 
// // //           d, color: isEraser ? '#16171d' : selectedColor, width: isEraser ? 25 : 4,
// // //           rotation: 0, scale: 1, centerX: center.x, centerY: center.y 
// // //         }]);
// // //         setCurrentPath([]);
// // //       }
// // //     },
// // //   }), [isSelectMode, zoomScale, paths, selectionBox, currentPath, selectedColor, isEraser]);

// // //   const transformSelected = (type) => {
// // //     if (selectedPathIndex === null) return;
// // //     const newPaths = [...paths];
// // //     const target = newPaths[selectedPathIndex];
// // //     if (type === 'rotate') target.rotation += 15;
// // //     if (type === 'plus') target.scale += 0.1;
// // //     if (type === 'minus') target.scale = Math.max(0.1, target.scale - 0.1);
// // //     setPaths(newPaths);
// // //   };

// // //   return (
// // //     <Modal visible={visible} animationType="slide">
// // //       <SafeAreaView style={styles.drawModal}>
// // //         <View style={styles.drawHeader}>
// // //           <TouchableOpacity onPress={onClose}><MaterialIcons name="close" size={28} color="#fff" /></TouchableOpacity>
// // //           <View style={styles.colorPalette}>
// // //             {COLORS.map(color => (
// // //               <TouchableOpacity key={color} onPress={() => {setSelectedColor(color); setIsEraser(false); setIsSelectMode(false);}}
// // //                 style={[styles.colorCircle, { backgroundColor: color, borderWidth: selectedColor === color && !isEraser ? 2 : 0, borderColor: '#fff' }]} />
// // //             ))}
// // //           </View>
// // //           <View style={styles.actionTools}>
// // //             <TouchableOpacity onPress={() => setZoomScale(prev => prev === 1 ? 2 : 1)} style={[styles.toolBtn, zoomScale > 1 && styles.activeTool]}>
// // //                <MaterialIcons name="zoom-in" size={24} color={zoomScale > 1 ? "#000" : "#fff"} />
// // //             </TouchableOpacity>
// // //             <TouchableOpacity onPress={() => {setIsSelectMode(!isSelectMode); setSelectedPathIndex(null);}} style={[styles.toolBtn, isSelectMode && styles.activeTool]}>
// // //                <MaterialIcons name="select-all" size={24} color={isSelectMode ? "#000" : "#fff"} />
// // //             </TouchableOpacity>
// // //           </View>
// // //         </View>

// // //         <View style={styles.canvasContainer}>
// // //           <ViewShot ref={viewShotRef} style={styles.shotBoundary}>
// // //             <View style={[styles.canvas, { transform: [{ scale: zoomScale }] }]} {...panResponder.panHandlers}>
// // //               <Svg height={CANVAS_HEIGHT} width={CANVAS_WIDTH}>
// // //                 {paths.map((path, i) => (
// // //                   <G key={i} transform={`rotate(${path.rotation}, ${path.centerX}, ${path.centerY}) translate(${path.centerX}, ${path.centerY}) scale(${path.scale}) translate(${-path.centerX}, ${-path.centerY})`}>
// // //                     <Path d={path.d} fill="none" stroke={path.color} strokeWidth={path.width} strokeLinecap="round" 
// // //                       opacity={selectedPathIndex === i ? 0.5 : 1}
// // //                       strokeDasharray={selectedPathIndex === i ? "5,5" : "0"} />
// // //                   </G>
// // //                 ))}
// // //                 {currentPath.length > 0 && <Path d={currentPath.join(' ')} fill="none" stroke={isEraser ? '#16171d' : selectedColor} strokeWidth={isEraser ? 25 : 4} strokeLinecap="round" />}
// // //                 {selectionBox && <Rect x={selectionBox.x} y={selectionBox.y} width={selectionBox.width} height={selectionBox.height} fill="rgba(183, 199, 255, 0.2)" stroke="#b7c7ff" strokeDasharray="4,4" />}
// // //               </Svg>
// // //             </View>
// // //           </ViewShot>

// // //           {selectedPathIndex !== null && (
// // //             <View style={styles.transformBox}>
// // //               <TouchableOpacity onPress={() => transformSelected('minus')} style={styles.miniBtn}><MaterialIcons name="remove" size={20} color="#fff" /></TouchableOpacity>
// // //               <TouchableOpacity onPress={() => transformSelected('rotate')} style={styles.miniBtn}><MaterialIcons name="rotate-right" size={20} color="#fff" /></TouchableOpacity>
// // //               <TouchableOpacity onPress={() => transformSelected('plus')} style={styles.miniBtn}><MaterialIcons name="add" size={20} color="#fff" /></TouchableOpacity>
// // //               <TouchableOpacity onPress={() => { setPaths(paths.filter((_, idx) => idx !== selectedPathIndex)); setSelectedPathIndex(null); }} style={[styles.miniBtn, {backgroundColor: '#ff6b6b'}]}><MaterialIcons name="delete" size={20} color="#fff" /></TouchableOpacity>
// // //             </View>
// // //           )}
// // //         </View>

// // //         <View style={styles.footer}>
// // //           <TouchableOpacity style={styles.footerBtn} onPress={() => setPaths(paths.slice(0, -1))}><MaterialIcons name="undo" size={26} color="#fff" /></TouchableOpacity>
// // //           <TouchableOpacity onPress={() => setIsEraser(!isEraser)} style={[styles.footerBtn, isEraser && styles.activeFooterBtn]}><MaterialIcons name="auto-fix-high" size={26} color={isEraser ? "#000" : "#fff"} /></TouchableOpacity>
// // //           <TouchableOpacity style={styles.insertBtn} onPress={async () => onInsert(await viewShotRef.current.capture(), CANVAS_WIDTH, CANVAS_HEIGHT)}>
// // //             <Text style={styles.insertBtnText}>Insert</Text>
// // //           </TouchableOpacity>
// // //         </View>
// // //       </SafeAreaView>
// // //     </Modal>
// // //   );
// // // }

// // // const styles = StyleSheet.create({
// // //   drawModal: { flex: 1, backgroundColor: '#0f1014' },
// // //   drawHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, alignItems: 'center', backgroundColor: '#16171d' },
// // //   colorPalette: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f1014', padding: 8, borderRadius: 25 },
// // //   colorCircle: { width: 18, height: 18, borderRadius: 9, marginHorizontal: 5 },
// // //   actionTools: { flexDirection: 'row', gap: 10 },
// // //   toolBtn: { padding: 8, borderRadius: 10, backgroundColor: '#25262b' },
// // //   activeTool: { backgroundColor: '#b7c7ff' },
// // //   canvasContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
// // //   shotBoundary: { width: CANVAS_WIDTH, height: CANVAS_HEIGHT, overflow: 'hidden' },
// // //   canvas: { width: CANVAS_WIDTH, height: CANVAS_HEIGHT, backgroundColor: '#16171d' },
// // //   transformBox: { position: 'absolute', bottom: 20, flexDirection: 'row', backgroundColor: '#25262b', padding: 10, borderRadius: 30, gap: 15 },
// // //   miniBtn: { width: 35, height: 35, borderRadius: 20, backgroundColor: '#444', justifyContent: 'center', alignItems: 'center' },
// // //   footer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 15, backgroundColor: '#16171d' },
// // //   footerBtn: { padding: 10, borderRadius: 15, backgroundColor: '#25262b' },
// // //   activeFooterBtn: { backgroundColor: '#b7c7ff' },
// // //   insertBtn: { backgroundColor: '#b7c7ff', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 30 },
// // //   insertBtnText: { fontWeight: 'bold', color: '#000' }
// // // });


// // import { MaterialIcons } from '@expo/vector-icons';
// // import React, { useMemo, useRef, useState } from 'react';
// // import {
// //   Dimensions,
// //   Modal,
// //   PanResponder,
// //   SafeAreaView,
// //   StyleSheet,
// //   Text,
// //   TouchableOpacity,
// //   View,
// // } from 'react-native';
// // import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';
// // import ViewShot from 'react-native-view-shot';

// // const { width: windowWidth } = Dimensions.get('window');
// // const COLORS = ['#fff', '#b7c7ff', '#ff6b6b', '#ffd93d', '#6bffbc', '#ff9ff3'];
// // const CANVAS_WIDTH = windowWidth - 20;
// // const CANVAS_HEIGHT = (CANVAS_WIDTH * 9) / 16;

// // export default function DrawingCanvas({ visible, onClose, onInsert }) {
// //   const [paths, setPaths] = useState([]);
// //   const [currentPath, setCurrentPath] = useState([]);
// //   const [selectedPathIndex, setSelectedPathIndex] = useState(null);
// //   const [isSelectMode, setIsSelectMode] = useState(false);
// //   const [selectionBox, setSelectionBox] = useState(null);
// //   const [selectedColor, setSelectedColor] = useState('#fff');
// //   const [isEraser, setIsEraser] = useState(false);
// //   const [isTransforming, setIsTransforming] = useState(false); 

// //   const viewShotRef = useRef(null);

// //   const getPathMeta = (pathData) => {
// //     if (!pathData || typeof pathData !== 'string') return null;
// //     const points = pathData.replace(/[ML]/g, '').trim().split(/\s+/);
// //     let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
// //     for (let i = 0; i < points.length; i += 2) {
// //       const x = parseFloat(points[i]);
// //       const y = parseFloat(points[i + 1]);
// //       if (!isNaN(x) && !isNaN(y)) {
// //         if (x < minX) minX = x; if (x > maxX) maxX = x;
// //         if (y < minY) minY = y; if (y > maxY) maxY = y;
// //       }
// //     }
// //     if (minX === Infinity) return null;
// //     return {
// //       x: (minX + maxX) / 2, y: (minY + maxY) / 2,
// //       minX, minY, maxX, maxY,
// //       width: maxX - minX, height: maxY - minY
// //     };
// //   };

// //   const checkSelection = (box) => {
// //     if (!box || box.width < 5) return;
// //     const foundIndex = paths.findIndex((p) => {
// //       const meta = getPathMeta(p.d);
// //       if (!meta) return false;
// //       return (
// //         meta.x >= box.x && meta.x <= box.x + box.width &&
// //         meta.y >= box.y && meta.y <= box.y + box.height
// //       );
// //     });
// //     setSelectedPathIndex(foundIndex !== -1 ? foundIndex : null);
// //   };

// //   const panResponder = useMemo(() => PanResponder.create({
// //     onStartShouldSetPanResponder: () => !isTransforming,
// //     onMoveShouldSetPanResponder: () => !isTransforming,
// //     onPanResponderGrant: (evt) => {
// //       const { locationX, locationY } = evt.nativeEvent;
// //       if (isSelectMode) {
// //         setSelectionBox({ x: locationX, y: locationY, width: 0, height: 0, startX: locationX, startY: locationY });
// //         setSelectedPathIndex(null);
// //       } else {
// //         setCurrentPath([`M${locationX.toFixed(1)} ${locationY.toFixed(1)}`]);
// //       }
// //     },
// //     onPanResponderMove: (evt) => {
// //       const { locationX, locationY } = evt.nativeEvent;
// //       if (isSelectMode && selectionBox) {
// //         setSelectionBox(prev => ({
// //           ...prev,
// //           x: Math.min(locationX, prev.startX),
// //           y: Math.min(locationY, prev.startY),
// //           width: Math.abs(locationX - prev.startX),
// //           height: Math.abs(locationY - prev.startY),
// //         }));
// //       } else if (!isSelectMode) {
// //         setCurrentPath(prev => [...prev, `L${locationX.toFixed(1)} ${locationY.toFixed(1)}`]);
// //       }
// //     },
// //     onPanResponderRelease: () => {
// //       if (isSelectMode && selectionBox) {
// //         checkSelection(selectionBox);
// //         setSelectionBox(null);
// //       } else if (!isSelectMode && currentPath.length > 0) {
// //         const d = currentPath.join(' ');
// //         setPaths(prev => [...prev, { d, color: isEraser ? '#16171d' : selectedColor, width: isEraser ? 25 : 4, rotation: 0, scale: 1 }]);
// //         setCurrentPath([]);
// //       }
// //     },
// //   }), [isSelectMode, paths, selectionBox, currentPath, selectedColor, isEraser, isTransforming]);

// //   const handleGestureTransform = (evt, type) => {
// //     if (selectedPathIndex === null) return;
// //     const { locationX, locationY } = evt.nativeEvent;
// //     const newPaths = [...paths];
// //     const target = newPaths[selectedPathIndex];
// //     const meta = getPathMeta(target.d);
// //     if (!meta) return;

// //     if (type === 'rotate') {
// //       const angle = Math.atan2(locationY - meta.y, locationX - meta.x) * (180 / Math.PI);
// //       target.rotation = angle + 90;
// //     } else if (type === 'scale') {
// //       const dist = Math.sqrt(Math.pow(locationX - meta.x, 2) + Math.pow(locationY - meta.y, 2));
// //       const initialDist = Math.sqrt(Math.pow(meta.width / 2, 2) + Math.pow(meta.height / 2, 2));
// //       const newScale = dist / initialDist;
      
// //       // লিমিট: ০.৫ থেকে ৩.০ এর মধ্যে বড়-ছোট হবে
// //       target.scale = Math.max(0.5, Math.min(3.0, newScale));
// //     }
// //     setPaths(newPaths);
// //   };

// //   return (
// //     <Modal visible={visible} animationType="slide">
// //       <SafeAreaView style={styles.drawModal}>
// //         <View style={styles.drawHeader}>
// //           <TouchableOpacity onPress={onClose}><MaterialIcons name="close" size={28} color="#fff" /></TouchableOpacity>
// //           <View style={styles.colorPalette}>
// //             {COLORS.map(color => (
// //               <TouchableOpacity key={color} onPress={() => {setSelectedColor(color); setIsEraser(false); setIsSelectMode(false);}}
// //                 style={[styles.colorCircle, { backgroundColor: color, borderWidth: selectedColor === color && !isEraser ? 2 : 0, borderColor: '#fff' }]} />
// //             ))}
// //           </View>
// //           <View style={styles.actionTools}>
// //             <TouchableOpacity onPress={() => {setIsSelectMode(!isSelectMode); setSelectedPathIndex(null);}} style={[styles.toolBtn, isSelectMode && styles.activeTool]}>
// //                <MaterialIcons name="select-all" size={24} color={isSelectMode ? "#000" : "#fff"} />
// //             </TouchableOpacity>
// //           </View>
// //         </View>

// //         <View style={styles.canvasContainer}>
// //           <ViewShot ref={viewShotRef} style={styles.shotBoundary} options={{ format: 'png', quality: 1.0 }}>
// //             <View style={styles.canvas} {...panResponder.panHandlers}>
// //               <Svg height={CANVAS_HEIGHT} width={CANVAS_WIDTH}>
// //                 {paths.map((path, i) => {
// //                   const meta = getPathMeta(path.d);
// //                   if (!meta) return null;
// //                   const isSelected = selectedPathIndex === i;

// //                   return (
// //                     <G key={i} transform={`rotate(${path.rotation}, ${meta.x}, ${meta.y}) translate(${meta.x}, ${meta.y}) scale(${path.scale}) translate(${-meta.x}, ${-meta.y})`}>
// //                       <Path d={path.d} fill="none" stroke={path.color} strokeWidth={path.width} strokeLinecap="round" opacity={isSelected ? 0.6 : 1} />
                      
// //                       {isSelected && isSelectMode && (
// //                         <G>
// //                           <Rect x={meta.minX - 10} y={meta.minY - 10} width={meta.width + 20} height={meta.height + 20} fill="none" stroke="#b7c7ff" strokeDasharray="5,5" />
                          
// //                           {/* রোটেশন হ্যান্ডেল */}
// //                           <Line x1={meta.x} y1={meta.minY - 10} x2={meta.x} y2={meta.minY - 40} stroke="#b7c7ff" strokeWidth="2" />
// //                           <Circle 
// //                             cx={meta.x} cy={meta.minY - 45} r={18} fill="#ffd93d"
// //                             onStartShouldSetResponder={() => true}
// //                             onResponderGrant={() => setIsTransforming(true)}
// //                             onResponderMove={(e) => handleGestureTransform(e, 'rotate')}
// //                             onResponderRelease={() => setIsTransforming(false)}
// //                           />
                          
// //                           {/* স্কেল হ্যান্ডেল */}
// //                           <Circle 
// //                             cx={meta.maxX + 10} cy={meta.maxY + 10} r={18} fill="#fff" stroke="#b7c7ff" strokeWidth="2"
// //                             onStartShouldSetResponder={() => true}
// //                             onResponderGrant={() => setIsTransforming(true)}
// //                             onResponderMove={(e) => handleGestureTransform(e, 'scale')}
// //                             onResponderRelease={() => setIsTransforming(false)}
// //                           />
// //                         </G>
// //                       )}
// //                     </G>
// //                   );
// //                 })}
// //                 {currentPath.length > 0 && <Path d={currentPath.join(' ')} fill="none" stroke={isEraser ? '#16171d' : selectedColor} strokeWidth={isEraser ? 25 : 4} strokeLinecap="round" />}
// //                 {selectionBox && <Rect x={selectionBox.x} y={selectionBox.y} width={selectionBox.width} height={selectionBox.height} fill="rgba(183, 199, 255, 0.1)" stroke="#b7c7ff" strokeDasharray="4,4" />}
// //               </Svg>
// //             </View>
// //           </ViewShot>

// //           {selectedPathIndex !== null && isSelectMode && (
// //             <TouchableOpacity style={styles.deleteFab} onPress={() => { setPaths(paths.filter((_, idx) => idx !== selectedPathIndex)); setSelectedPathIndex(null); }}>
// //               <MaterialIcons name="delete-forever" size={28} color="#fff" />
// //             </TouchableOpacity>
// //           )}
// //         </View>

// //         <View style={styles.footer}>
// //           <TouchableOpacity style={styles.footerBtn} onPress={() => setPaths(paths.slice(0, -1))}><MaterialIcons name="undo" size={26} color="#fff" /></TouchableOpacity>
// //           <TouchableOpacity onPress={() => setIsEraser(!isEraser)} style={[styles.footerBtn, isEraser && styles.activeFooterBtn]}><MaterialIcons name="auto-fix-high" size={26} color={isEraser ? "#000" : "#fff"} /></TouchableOpacity>
// //           <TouchableOpacity style={styles.insertBtn} onPress={async () => {
// //               const uri = await viewShotRef.current.capture();
// //               onInsert(uri, CANVAS_WIDTH, CANVAS_HEIGHT);
// //               onClose();
// //           }}>
// //             <Text style={styles.insertBtnText}>Insert to Diary</Text>
// //           </TouchableOpacity>
// //         </View>
// //       </SafeAreaView>
// //     </Modal>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   drawModal: { flex: 1, backgroundColor: '#0f1014' },
// //   drawHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, alignItems: 'center', backgroundColor: '#16171d' },
// //   colorPalette: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f1014', padding: 8, borderRadius: 25 },
// //   colorCircle: { width: 18, height: 18, borderRadius: 9, marginHorizontal: 5 },
// //   actionTools: { flexDirection: 'row', gap: 10 },
// //   toolBtn: { padding: 8, borderRadius: 10, backgroundColor: '#25262b' },
// //   activeTool: { backgroundColor: '#b7c7ff' },
// //   canvasContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
// //   shotBoundary: { width: CANVAS_WIDTH, height: CANVAS_HEIGHT, overflow: 'hidden', backgroundColor: '#16171d' },
// //   canvas: { width: CANVAS_WIDTH, height: CANVAS_HEIGHT },
// //   deleteFab: { position: 'absolute', top: 20, right: 20, backgroundColor: '#ff6b6b', padding: 15, borderRadius: 40, elevation: 5 },
// //   footer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 15, backgroundColor: '#16171d' },
// //   footerBtn: { padding: 10, borderRadius: 15, backgroundColor: '#25262b' },
// //   activeFooterBtn: { backgroundColor: '#b7c7ff' },
// //   insertBtn: { backgroundColor: '#b7c7ff', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 30 },
// //   insertBtnText: { fontWeight: 'bold', color: '#000' }
// // });


// import { MaterialIcons } from '@expo/vector-icons';
// import React, { useMemo, useRef, useState } from 'react';
// import {
//   Dimensions,
//   Modal,
//   PanResponder,
//   SafeAreaView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import Svg, { Circle, G, Path, Rect } from 'react-native-svg';
// import ViewShot from 'react-native-view-shot';

// const { width: windowWidth } = Dimensions.get('window');
// const COLORS = ['#fff', '#b7c7ff', '#ff6b6b', '#ffd93d', '#6bffbc', '#ff9ff3'];
// const CANVAS_WIDTH = windowWidth - 20;
// const CANVAS_HEIGHT = (CANVAS_WIDTH * 9) / 16;

// export default function DrawingCanvas({ visible, onClose, onInsert }) {
//   const [paths, setPaths] = useState([]);
//   const [redoStack, setRedoStack] = useState([]); // Redo-র জন্য নতুন স্টেট
//   const [currentPath, setCurrentPath] = useState([]);
//   const [selectedPathIndex, setSelectedPathIndex] = useState(null);
//   const [isSelectMode, setIsSelectMode] = useState(false);
//   const [selectionBox, setSelectionBox] = useState(null);
//   const [selectedColor, setSelectedColor] = useState('#fff');
//   const [isEraser, setIsEraser] = useState(false);
//   const [isTransforming, setIsTransforming] = useState(false); 

//   const viewShotRef = useRef(null);

//   // টুল সুইচিং লজিক: একটি অন হলে অন্যটি অফ
//   const toggleSelectMode = () => {
//     setIsSelectMode(!isSelectMode);
//     setIsEraser(false); // সিলেকশন অন হলে ইরেজার অফ
//     setSelectedPathIndex(null);
//   };

//   const toggleEraser = () => {
//     setIsEraser(!isEraser);
//     setIsSelectMode(false); // ইরেজার অন হলে সিলেকশন অফ
//     setSelectedPathIndex(null);
//   };

//   const undo = () => {
//     if (paths.length > 0) {
//       const lastPath = paths[paths.length - 1];
//       setRedoStack(prev => [...prev, lastPath]);
//       setPaths(prev => prev.slice(0, -1));
//       setSelectedPathIndex(null);
//     }
//   };

//   const redo = () => {
//     if (redoStack.length > 0) {
//       const nextPath = redoStack[redoStack.length - 1];
//       setPaths(prev => [...prev, nextPath]);
//       setRedoStack(prev => prev.slice(0, -1));
//     }
//   };

//   const getPathMeta = (pathData) => {
//     if (!pathData || typeof pathData !== 'string') return null;
//     const points = pathData.replace(/[ML]/g, '').trim().split(/\s+/);
//     let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
//     for (let i = 0; i < points.length; i += 2) {
//       const x = parseFloat(points[i]);
//       const y = parseFloat(points[i + 1]);
//       if (!isNaN(x) && !isNaN(y)) {
//         if (x < minX) minX = x; if (x > maxX) maxX = x;
//         if (y < minY) minY = y; if (y > maxY) maxY = y;
//       }
//     }
//     if (minX === Infinity) return null;
//     return {
//       x: (minX + maxX) / 2, y: (minY + maxY) / 2,
//       minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY
//     };
//   };

//   const checkSelection = (box) => {
//     if (!box || box.width < 5) return;
//     const foundIndex = paths.findIndex((p) => {
//       const meta = getPathMeta(p.d);
//       if (!meta) return false;
//       return (
//         meta.x >= box.x && meta.x <= box.x + box.width &&
//         meta.y >= box.y && meta.y <= box.y + box.height
//       );
//     });
//     setSelectedPathIndex(foundIndex !== -1 ? foundIndex : null);
//   };

//   const panResponder = useMemo(() => PanResponder.create({
//     onStartShouldSetPanResponder: () => !isTransforming,
//     onPanResponderGrant: (evt) => {
//       const { locationX, locationY } = evt.nativeEvent;
//       if (isSelectMode) {
//         setSelectionBox({ x: locationX, y: locationY, width: 0, height: 0, startX: locationX, startY: locationY });
//       } else {
//         setCurrentPath([`M${locationX.toFixed(1)} ${locationY.toFixed(1)}`]);
//       }
//     },
//     onPanResponderMove: (evt) => {
//       const { locationX, locationY } = evt.nativeEvent;
//       if (isSelectMode && selectionBox) {
//         setSelectionBox(prev => ({
//           ...prev, x: Math.min(locationX, prev.startX), y: Math.min(locationY, prev.startY),
//           width: Math.abs(locationX - prev.startX), height: Math.abs(locationY - prev.startY),
//         }));
//       } else if (!isSelectMode) {
//         setCurrentPath(prev => [...prev, `L${locationX.toFixed(1)} ${locationY.toFixed(1)}`]);
//       }
//     },
//     onPanResponderRelease: () => {
//       if (isSelectMode && selectionBox) {
//         checkSelection(selectionBox);
//         setSelectionBox(null);
//       } else if (!isSelectMode && currentPath.length > 0) {
//         const d = currentPath.join(' ');
//         setPaths(prev => [...prev, { d, color: isEraser ? '#16171d' : selectedColor, width: isEraser ? 25 : 4, rotation: 0, scale: 1 }]);
//         setRedoStack([]); 
//         setCurrentPath([]);
//       }
//     },
//   }), [isSelectMode, paths, selectionBox, currentPath, selectedColor, isEraser, isTransforming]);

//   const handleGestureTransform = (evt, type) => {
//     if (selectedPathIndex === null) return;
//     const { locationX, locationY } = evt.nativeEvent;
//     const newPaths = [...paths];
//     const target = newPaths[selectedPathIndex];
//     const meta = getPathMeta(target.d);
//     if (!meta) return;

//     if (type === 'rotate') {
//       const angle = Math.atan2(locationY - meta.y, locationX - meta.x) * (180 / Math.PI);
//       target.rotation = angle + 90;
//     } else if (type === 'scale') {
//       const dist = Math.sqrt(Math.pow(locationX - meta.x, 2) + Math.pow(locationY - meta.y, 2));
//       const initialDist = Math.sqrt(Math.pow(meta.width / 2, 2) + Math.pow(meta.height / 2, 2));
//       target.scale = Math.max(0.5, Math.min(3.0, dist / initialDist));
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
//               <TouchableOpacity key={color} onPress={() => {setSelectedColor(color); setIsEraser(false); setIsSelectMode(false);}}
//                 style={[styles.colorCircle, { backgroundColor: color, borderWidth: selectedColor === color && !isEraser && !isSelectMode ? 2 : 0, borderColor: '#fff' }]} />
//             ))}
//           </View>
//           <View style={styles.actionTools}>
//             <TouchableOpacity onPress={toggleSelectMode} style={[styles.toolBtn, isSelectMode && styles.activeTool]}>
//                <MaterialIcons name="select-all" size={24} color={isSelectMode ? "#000" : "#fff"} />
//             </TouchableOpacity>
//           </View>
//         </View>

//         <View style={styles.canvasContainer}>
//           <ViewShot ref={viewShotRef} style={styles.shotBoundary} options={{ format: 'png', quality: 1.0 }}>
//             <View style={styles.canvas} {...panResponder.panHandlers}>
//               <Svg height={CANVAS_HEIGHT} width={CANVAS_WIDTH}>
//                 {paths.map((path, i) => {
//                   const meta = getPathMeta(path.d);
//                   if (!meta) return null;
//                   const isSelected = selectedPathIndex === i;
//                   return (
//                     <G key={i} transform={`rotate(${path.rotation}, ${meta.x}, ${meta.y}) translate(${meta.x}, ${meta.y}) scale(${path.scale}) translate(${-meta.x}, ${-meta.y})`}>
//                       <Path d={path.d} fill="none" stroke={path.color} strokeWidth={path.width} strokeLinecap="round" opacity={isSelected ? 0.6 : 1} />
//                       {isSelected && isSelectMode && (
//                         <G>
//                           <Rect x={meta.minX - 10} y={meta.minY - 10} width={meta.width + 20} height={meta.height + 20} fill="none" stroke="#b7c7ff" strokeDasharray="5,5" />
//                           <Circle cx={meta.x} cy={meta.minY - 45} r={18} fill="#ffd93d"
//                             onStartShouldSetResponder={() => true}
//                             onResponderGrant={() => setIsTransforming(true)}
//                             onResponderMove={(e) => handleGestureTransform(e, 'rotate')}
//                             onResponderRelease={() => setIsTransforming(false)} />
//                           <Circle cx={meta.maxX + 10} cy={meta.maxY + 10} r={18} fill="#fff" stroke="#b7c7ff" strokeWidth="2"
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
//                 {selectionBox && <Rect x={selectionBox.x} y={selectionBox.y} width={selectionBox.width} height={selectionBox.height} fill="rgba(183, 199, 255, 0.1)" stroke="#b7c7ff" strokeDasharray="4,4" />}
//               </Svg>
//             </View>
//           </ViewShot>

//           {selectedPathIndex !== null && isSelectMode && (
//             <TouchableOpacity style={styles.deleteFab} onPress={() => { setPaths(paths.filter((_, idx) => idx !== selectedPathIndex)); setSelectedPathIndex(null); }}>
//               <MaterialIcons name="delete-forever" size={28} color="#fff" />
//             </TouchableOpacity>
//           )}
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
          
//           <TouchableOpacity style={styles.insertBtn} onPress={async () => {
//               const uri = await viewShotRef.current.capture();
//               onInsert(uri, CANVAS_WIDTH, CANVAS_HEIGHT);
//               onClose();
//           }}>
//             <Text style={styles.insertBtnText}>Insert</Text>
//           </TouchableOpacity>
//         </View>
//       </SafeAreaView>
//     </Modal>
//   );
// }

// const styles = StyleSheet.create({
//   drawModal: { flex: 1, backgroundColor: '#0f1014' },
//   drawHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, alignItems: 'center', backgroundColor: '#16171d' },
//   colorPalette: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f1014', padding: 8, borderRadius: 25 },
//   colorCircle: { width: 18, height: 18, borderRadius: 9, marginHorizontal: 5 },
//   actionTools: { flexDirection: 'row', gap: 10 },
//   toolBtn: { padding: 8, borderRadius: 10, backgroundColor: '#25262b' },
//   activeTool: { backgroundColor: '#b7c7ff' },
//   canvasContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
//   shotBoundary: { width: CANVAS_WIDTH, height: CANVAS_HEIGHT, overflow: 'hidden', backgroundColor: '#16171d' },
//   canvas: { width: CANVAS_WIDTH, height: CANVAS_HEIGHT },
//   deleteFab: { position: 'absolute', top: 20, right: 20, backgroundColor: '#ff6b6b', padding: 15, borderRadius: 40 },
//   footer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 15, backgroundColor: '#16171d' },
//   undoRedoGroup: { flexDirection: 'row', gap: 10 },
//   footerBtn: { padding: 10, borderRadius: 15, backgroundColor: '#25262b' },
//   activeFooterBtn: { backgroundColor: '#b7c7ff' },
//   insertBtn: { backgroundColor: '#b7c7ff', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 30 },
//   insertBtnText: { fontWeight: 'bold', color: '#000' }
// });