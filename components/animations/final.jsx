
// //AppIntro.jsx

// import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
// import React, { useEffect, useRef, useState } from 'react';
// import { Animated, Dimensions, Easing, StyleSheet, Text, View } from 'react-native';
// import Svg, { Circle } from 'react-native-svg';

// const GOLD = '#F3C623';
// const { width: SCREEN_WIDTH } = Dimensions.get('window');

// // ১. বইয়ের সাইজ ছোট করা হলো
// const BOOK_WIDTH = 110;
// const PAGE_WIDTH = BOOK_WIDTH / 2;

// // ২. সার্কেলের ব্যাসার্ধ (Radius) এবং পরিধি আপডেট
// const CIRCLE_RADIUS = 35;
// const CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

// export default function AppIntro({ onFinish }) {
//     const bookFlip = useRef(new Animated.Value(0)).current;
//     const writingVibe = useRef(new Animated.Value(0)).current;
//     const smokeTrigger = useRef(new Animated.Value(0)).current;
//     const loaderProgress = useRef(new Animated.Value(0)).current;
//     const contentFade = useRef(new Animated.Value(0)).current;
//     const AnimatedCircle = Animated.createAnimatedComponent(Circle);

//     const [showPlayButton, setShowPlayButton] = useState(false);
//     const playBtnAnim = useRef(new Animated.Value(0)).current;

//     const readAnim = useRef(new Animated.Value(0)).current;
//     const listenAnim = useRef(new Animated.Value(0)).current;
//     const writeAnim = useRef(new Animated.Value(0)).current;

//     const holeEffect = useRef(new Animated.Value(1)).current;
//     const loaderFade = useRef(new Animated.Value(0)).current;

//     useEffect(() => {
//         Animated.sequence([
//             Animated.parallel([
//                 Animated.timing(bookFlip, { toValue: 1, duration: 3000, easing: Easing.bezier(0.4, 0, 0.2, 1), useNativeDriver: true }),
//                 Animated.timing(smokeTrigger, { toValue: 1, duration: 2500, useNativeDriver: true }),
//                 Animated.timing(contentFade, { toValue: 1, duration: 2000, useNativeDriver: true }),
//                 Animated.timing(writingVibe, { toValue: 1, duration: 2000, useNativeDriver: true }),

//                 Animated.sequence([
//                     Animated.delay(700),
//                     Animated.stagger(400, [
//                         Animated.spring(readAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
//                         Animated.spring(listenAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
//                         Animated.spring(writeAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
//                     ])
//                 ])
//             ]),

//             Animated.timing(holeEffect, { toValue: 0, duration: 1200, easing: Easing.in(Easing.back(1)), useNativeDriver: true }),

//             Animated.parallel([
//                 Animated.timing(loaderFade, { toValue: 1, duration: 400, useNativeDriver: true }),
//                 Animated.timing(loaderProgress, { toValue: 1, duration: 1000, easing: Easing.out(Easing.quad), useNativeDriver: true })
//             ])
//         ]).start(() => {
//             setTimeout(() => { if (onFinish) onFinish(); }, 200);
//         });
//     }, []);

//     const mainFlip = bookFlip.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-180deg'] });

//     const getAnimatedStyle = (anim, index) => {
//         const xOffset = index === 0 ? 60 : index === 2 ? -60 : 0; // ছোট বইয়ের জন্য অফসেট কমানো হয়েছে
//         return {
//             opacity: Animated.multiply(anim, holeEffect),
//             transform: [
//                 { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [15, 0] }) },
//                 { translateY: holeEffect.interpolate({ inputRange: [0, 1], outputRange: [-60, 0] }) },
//                 { translateX: holeEffect.interpolate({ inputRange: [0, 1], outputRange: [xOffset, 0] }) },
//                 { scale: Animated.multiply(anim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }), holeEffect) }
//             ]
//         };
//     };

//     return (
//         <View style={styles.splashContainer}>
//             <Animated.View style={styles.mainWrapper}>
//                 <View style={styles.bookWrapper}>
//                     <Animated.View style={[styles.svgContainer, {
//                         transform: [
//                             // { scale: smokeTrigger.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) },
//                             { translateX: writingVibe.interpolate({ inputRange: [0, 1], outputRange: [-2, 2] }) }
//                         ]
//                     }]}>
//                         {/* ৩. সার্কেল সাইজ কমানো হয়েছে */}
//                         <Svg height="240" width="240" viewBox="0 0 100 100">
//                             <AnimatedCircle cx="50" cy="50" r={CIRCLE_RADIUS} stroke={GOLD} strokeWidth="2.5" fill="transparent"
//                                 strokeDasharray={CIRCUMFERENCE}
//                                 strokeDashoffset={smokeTrigger.interpolate({ inputRange: [0, 1], outputRange: [CIRCUMFERENCE, 0] })}
//                                 strokeLinecap="round" rotation="-90" origin="50, 50"
//                             />
//                         </Svg>
//                     </Animated.View>

//                     {/* ৪. বইয়ের উচ্চতা অ্যাডজাস্ট করা হয়েছে */}
//                     <View style={styles.bookBase}>
//                         <View style={styles.pageLeftBase}>
//                             {[40, 60, 30].map((w, i) => (
//                                 <Animated.View key={i} style={[styles.shadowLine, {
//                                     width: `${w}%`,
//                                     opacity: writingVibe.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
//                                     transform: [{ scaleX: writingVibe }]
//                                 }]} />
//                             ))}
//                         </View>
//                         <View style={styles.pageRightBase}>
//                             {[50, 35, 65, 80].map((w, i) => (
//                                 <Animated.View key={i} style={[styles.shadowLine, {
//                                     width: `${w}%`,
//                                     opacity: writingVibe.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
//                                     transform: [{ scaleX: writingVibe }]
//                                 }]} />
//                             ))}
//                         </View>
//                         <Animated.View style={[styles.flipCard, {
//                             transform: [{ perspective: 1000 }, { translateX: -PAGE_WIDTH / 2 }, { rotateY: mainFlip }, { translateX: PAGE_WIDTH / 2 }],
//                             zIndex: bookFlip.interpolate({ inputRange: [0, 0.5, 0.51, 1], outputRange: [10, 10, 0, 0] })
//                         }]}>
//                             <View style={[styles.pageFace, styles.pageFront]}>
//                                 {[60, 40, 70].map((w, i) => <View key={i} style={[styles.shadowLine, { width: `${w}%`, opacity: 0.5 }]} />)}
//                             </View>
//                             <Animated.View style={[styles.pageFace, styles.pageBack, { transform: [{ rotateY: '180deg' }] }]}>
//                                 {[60, 50, 70, 30].map((w, i) => <View key={i} style={[styles.shadowLine, { width: `${w}%`, opacity: 0.7 }]} />)}
//                             </Animated.View>
//                         </Animated.View>
//                     </View>
//                 </View>

//                 <Animated.View style={{ opacity: contentFade, marginTop: 30 }}>
//                     <View style={styles.logoTextRow}>
//                         <Text style={[styles.brandText, { color: '#fff' }]}>গল্প </Text>
//                         <Text style={[styles.brandText, { color: GOLD }]}>জল্প</Text>
//                     </View>
//                 </Animated.View>

//                 <View style={styles.stepsContainer}>
//                     <Animated.View style={[styles.stepBox, getAnimatedStyle(readAnim, 0)]}>
//                         <MaterialCommunityIcons name="book-open-variant" size={20} color={GOLD} />
//                         <Text style={styles.stepText}>পড়ুন</Text>
//                     </Animated.View>
//                     <Animated.View style={[styles.stepDivider, { opacity: Animated.multiply(listenAnim, holeEffect) }]} />
//                     <Animated.View style={[styles.stepBox, getAnimatedStyle(listenAnim, 1)]}>
//                         <Ionicons name="headset" size={18} color={GOLD} />
//                         <Text style={styles.stepText}>শুনুন</Text>
//                     </Animated.View>
//                     <Animated.View style={[styles.stepDivider, { opacity: Animated.multiply(writeAnim, holeEffect) }]} />
//                     <Animated.View style={[styles.stepBox, getAnimatedStyle(writeAnim, 2)]}>
//                         <FontAwesome5 name="pen-nib" size={14} color={GOLD} />
//                         <Text style={styles.stepText}>লিখুন</Text>
//                     </Animated.View>
//                 </View>
//             </Animated.View>

//             <Animated.View style={[styles.loaderBg, { opacity: loaderFade }]}>
//                 <Animated.View style={[styles.loaderFill, {
//                     transform: [
//                         { translateX: -60 },
//                         { scaleX: loaderProgress },
//                         { translateX: 60 }
//                     ]
//                 }]} />
//             </Animated.View>
//         </View>
//     );
// }

// const styles = StyleSheet.create({
//     splashContainer: { flex: 1, backgroundColor: '#1c131e', justifyContent: 'center', alignItems: 'center' },
//     mainWrapper: { alignItems: 'center', width: '100%' },
//     bookWrapper: { position: 'relative' },
//     // উচ্চতা ৯৫ থেকে ৮০ করা হয়েছে
//     bookBase: { width: BOOK_WIDTH, height: BOOK_WIDTH, flexDirection: 'row', backgroundColor: '#F7E6C4', borderRadius: 4, elevation: 15, padding: 1 },
//     pageLeftBase: { flex: 1, backgroundColor: '#FFF8DC', borderTopLeftRadius: 4, borderBottomLeftRadius: 4, padding: 8, borderRightWidth: 1.5, borderRightColor: '#F0E5CF', justifyContent: 'center' },
//     pageRightBase: { flex: 1, backgroundColor: '#FFF8DC', borderTopRightRadius: 4, borderBottomRightRadius: 4, padding: 8, justifyContent: 'center' },
//     flipCard: { position: 'absolute', left: '50%', width: PAGE_WIDTH, height: '100%' },
//     pageFace: { position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', backgroundColor: '#FEFBF3', padding: 8, justifyContent: 'center' },
//     pageFront: { borderTopRightRadius: 4, borderBottomRightRadius: 4, borderLeftWidth: 1, borderLeftColor: '#F0E5CF' },
//     pageBack: { borderTopLeftRadius: 4, borderBottomLeftRadius: 4, borderRightWidth: 1.5, borderRightColor: '#E8D2A6', backgroundColor: '#F9F5EB' },
//     shadowLine: { height: 2.5, backgroundColor: '#D7C0AE', marginBottom: 4, borderRadius: 2 },
//     logoTextRow: { flexDirection: 'row' },
//     brandText: { fontSize: 30, fontWeight: '900', letterSpacing: 1 },
//     stepsContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 15, height: 40 },
//     stepBox: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 },
//     stepText: { color: '#E0E0E0', fontSize: 14, fontWeight: '600', marginLeft: 6 },
//     stepDivider: { width: 1, height: 12, backgroundColor: '#444', marginHorizontal: 4 },
//     loaderBg: { width: 120, height: 3, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, overflow: 'hidden', position: 'absolute', bottom: 330 },
//     loaderFill: { width: 120, height: '100%', backgroundColor: GOLD, borderRadius: 10 },
//     svgContainer: {
//         position: 'absolute', justifyContent: 'center', alignItems: 'center', zIndex: -1, top: -65,
//         left: -65, // সার্কেলকে ডানে-বামে সেন্টার করতে
//         right: -65, alignSelf: 'center'
//     },
// });

// সেকেন্ড ভাইব ফিচার

// //AppIntro
// import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
// import React, { useEffect, useRef } from 'react';
// import { Animated, Dimensions, Easing, StyleSheet, Text, View } from 'react-native';
// import Svg, { Circle } from 'react-native-svg';

// const GOLD = '#F3C623';
// const { width: SCREEN_WIDTH } = Dimensions.get('window');

// const BOOK_WIDTH = 110;
// const PAGE_WIDTH = BOOK_WIDTH / 2;
// const CIRCLE_RADIUS = 35;
// const CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

// export default function AppIntro({ onFinish }) {
//     const bookFlip = useRef(new Animated.Value(0)).current;
//     const writingVibe = useRef(new Animated.Value(0)).current;
//     const smokeTrigger = useRef(new Animated.Value(0)).current;
//     const loaderProgress = useRef(new Animated.Value(0)).current;
//     const contentFade = useRef(new Animated.Value(0)).current;
//     const AnimatedCircle = Animated.createAnimatedComponent(Circle);

//     const readAnim = useRef(new Animated.Value(0)).current;
//     const listenAnim = useRef(new Animated.Value(0)).current;
//     const writeAnim = useRef(new Animated.Value(0)).current;

//     const holeEffect = useRef(new Animated.Value(1)).current;
//     const loaderFade = useRef(new Animated.Value(0)).current;
    
//     // বইকে ত্রিভুজ বানানোর জন্য এনিমেশন ভ্যালু
//     const transformToTriangle = useRef(new Animated.Value(0)).current;

//     useEffect(() => {
//         Animated.sequence([
//             Animated.parallel([
//                 Animated.timing(bookFlip, { toValue: 1, duration: 3000, easing: Easing.bezier(0.4, 0, 0.2, 1), useNativeDriver: true }),
//                 Animated.timing(smokeTrigger, { toValue: 1, duration: 2500, useNativeDriver: true }),
//                 Animated.timing(contentFade, { toValue: 1, duration: 2000, useNativeDriver: true }),
//                 Animated.timing(writingVibe, { toValue: 1, duration: 2000, useNativeDriver: true }),

//                 Animated.sequence([
//                     Animated.delay(700),
//                     Animated.stagger(400, [
//                         Animated.spring(readAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
//                         Animated.spring(listenAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
//                         Animated.spring(writeAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
//                     ])
//                 ])
//             ]),

//             Animated.timing(holeEffect, { toValue: 0, duration: 1200, easing: Easing.in(Easing.back(1)), useNativeDriver: true }),

//             Animated.parallel([
//                 Animated.timing(loaderFade, { toValue: 1, duration: 400, useNativeDriver: true }),
//                 Animated.timing(loaderProgress, { toValue: 1, duration: 1000, easing: Easing.out(Easing.quad), useNativeDriver: true })
//             ]),

//             // এনিমেশন শেষে বই ঘুরবে এবং ত্রিভুজ হবে
//             Animated.timing(transformToTriangle, {
//                 toValue: 1,
//                 duration: 800,
//                 easing: Easing.bezier(0.34, 1.56, 0.64, 1),
//                 useNativeDriver: true
//             })
//         ]).start(() => {
//             setTimeout(() => { if (onFinish) onFinish(); }, 600);
//         });
//     }, []);

//     const mainFlip = bookFlip.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-180deg'] });

//     // ইন্টারপোলেশন: ৯০ ডিগ্রি রোটেশন এবং ত্রিভুজ শেপ ইফেক্ট
//     const bookRotate = transformToTriangle.interpolate({
//         inputRange: [0, 1],
//         outputRange: ['0deg', '90deg']
//     });

//     const bookScale = transformToTriangle.interpolate({
//         inputRange: [0, 1],
//         outputRange: [1, 0.55] // ত্রিভুজটি সার্কেলের ভেতরে ফিট হওয়ার জন্য স্কেল কমানো হয়েছে
//     });

//     const getAnimatedStyle = (anim, index) => {
//         const xOffset = index === 0 ? 60 : index === 2 ? -60 : 0;
//         return {
//             opacity: Animated.multiply(anim, holeEffect),
//             transform: [
//                 { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [15, 0] }) },
//                 { translateY: holeEffect.interpolate({ inputRange: [0, 1], outputRange: [-60, 0] }) },
//                 { translateX: holeEffect.interpolate({ inputRange: [0, 1], outputRange: [xOffset, 0] }) },
//                 { scale: Animated.multiply(anim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }), holeEffect) }
//             ]
//         };
//     };

//     return (
//         <View style={styles.splashContainer}>
//             <Animated.View style={styles.mainWrapper}>
                
//                 <View style={styles.bookWrapper}>
//                     {/* সার্কেলটি আগের মতোই থাকবে */}
//                     <Animated.View style={[styles.svgContainer, {
//                         transform: [
//                             { translateX: writingVibe.interpolate({ inputRange: [0, 1], outputRange: [-2, 2] }) }
//                         ]
//                     }]}>
//                         <Svg height="240" width="240" viewBox="0 0 100 100">
//                             <AnimatedCircle cx="50" cy="50" r={CIRCLE_RADIUS} stroke={GOLD} strokeWidth="2.5" fill="transparent"
//                                 strokeDasharray={CIRCUMFERENCE}
//                                 strokeDashoffset={smokeTrigger.interpolate({ inputRange: [0, 1], outputRange: [CIRCUMFERENCE, 0] })}
//                                 strokeLinecap="round" rotation="-90" origin="50, 50"
//                             />
//                         </Svg>
//                     </Animated.View>

//                     {/* বইয়ের অংশটি ৯০ ডিগ্রি ঘুরে ত্রিভুজ হবে */}
//                     <Animated.View style={[
//                         styles.bookBase, 
//                         { 
//                             transform: [
//                                 { rotate: bookRotate },
//                                 { scale: bookScale }
//                             ],
//                             backgroundColor: transformToTriangle.interpolate({
//                                 inputRange: [0, 1],
//                                 outputRange: ['#F7E6C4', GOLD] // শেষ মুহূর্তে এটি পুরোপুরি গোল্ডেন হয়ে যাবে
//                             }),
//                         }
//                     ]}>
//                         {/* বইয়ের ভেতরের কন্টেন্ট (যা ত্রিভুজ হওয়ার সময় মিলিয়ে যাবে) */}
//                         <Animated.View style={[styles.innerContent, { opacity: holeEffect }]}>
//                             <View style={styles.pageLeftBase}>
//                                 {[40, 60, 30].map((w, i) => <View key={i} style={[styles.shadowLine, { width: `${w}%` }]} />)}
//                             </View>
//                             <View style={styles.pageRightBase}>
//                                 {[50, 35, 65, 80].map((w, i) => <View key={i} style={[styles.shadowLine, { width: `${w}%` }]} />)}
//                             </View>
//                             <Animated.View style={[styles.flipCard, {
//                                 transform: [{ perspective: 1000 }, { translateX: -PAGE_WIDTH / 2 }, { rotateY: mainFlip }, { translateX: PAGE_WIDTH / 2 }],
//                                 zIndex: bookFlip.interpolate({ inputRange: [0, 0.5, 0.51, 1], outputRange: [10, 10, 0, 0] })
//                             }]}>
//                                 <View style={[styles.pageFace, styles.pageFront]}>
//                                     {[60, 40, 70].map((w, i) => <View key={i} style={[styles.shadowLine, { width: `${w}%`, opacity: 0.5 }]} />)}
//                                 </View>
//                                 <View style={[styles.pageFace, styles.pageBack, { transform: [{ rotateY: '180deg' }] }]}>
//                                     {[60, 50, 70, 30].map((w, i) => <View key={i} style={[styles.shadowLine, { width: `${w}%`, opacity: 0.7 }]} />)}
//                                 </View>
//                             </Animated.View>
//                         </Animated.View>

//                         {/* ত্রিভুজ আইকন যা রোটেশনের পর সোজা হয়ে প্লে বাটন দেখাবে */}
//                         <Animated.View style={[styles.triangleOverlay, { opacity: transformToTriangle }]}>
//                              <Ionicons name="play" size={60} color="#1c131e" />
//                         </Animated.View>
//                     </Animated.View>
//                 </View>

//                 {/* লোগো এবং টেক্সট */}
//                 <Animated.View style={{ opacity: contentFade, marginTop: 30 }}>
//                     <View style={styles.logoTextRow}>
//                         <Text style={[styles.brandText, { color: '#fff' }]}>গল্প </Text>
//                         <Text style={[styles.brandText, { color: GOLD }]}>জল্প</Text>
//                     </View>
//                 </Animated.View>

//                 {/* স্টেপস এনিমেশন */}
//                 <View style={styles.stepsContainer}>
//                     <Animated.View style={[styles.stepBox, getAnimatedStyle(readAnim, 0)]}>
//                         <MaterialCommunityIcons name="book-open-variant" size={20} color={GOLD} />
//                         <Text style={styles.stepText}>পড়ুন</Text>
//                     </Animated.View>
//                     <Animated.View style={[styles.stepDivider, { opacity: Animated.multiply(listenAnim, holeEffect) }]} />
//                     <Animated.View style={[styles.stepBox, getAnimatedStyle(listenAnim, 1)]}>
//                         <Ionicons name="headset" size={18} color={GOLD} />
//                         <Text style={styles.stepText}>শুনুন</Text>
//                     </Animated.View>
//                     <Animated.View style={[styles.stepDivider, { opacity: Animated.multiply(writeAnim, holeEffect) }]} />
//                     <Animated.View style={[styles.stepBox, getAnimatedStyle(writeAnim, 2)]}>
//                         <FontAwesome5 name="pen-nib" size={14} color={GOLD} />
//                         <Text style={styles.stepText}>লিখুন</Text>
//                     </Animated.View>
//                 </View>
//             </Animated.View>

//             {/* লোডার */}
//             <Animated.View style={[styles.loaderBg, { opacity: loaderFade }]}>
//                 <Animated.View style={[styles.loaderFill, {
//                     transform: [
//                         { translateX: -60 },
//                         { scaleX: loaderProgress },
//                         { translateX: 60 }
//                     ]
//                 }]} />
//             </Animated.View>
//         </View>
//     );
// }

// const styles = StyleSheet.create({
//     splashContainer: { flex: 1, backgroundColor: '#1c131e', justifyContent: 'center', alignItems: 'center' },
//     mainWrapper: { alignItems: 'center', width: '100%' },
//     bookWrapper: { position: 'relative', width: 240, height: 120, justifyContent: 'center', alignItems: 'center' },
//     bookBase: { 
//         width: BOOK_WIDTH, 
//         height: BOOK_WIDTH, 
//         borderRadius: 15, 
//         overflow: 'hidden',
//         justifyContent: 'center',
//         alignItems: 'center',
//         backgroundColor: '#F7E6C4',
//     },
//     innerContent: { flexDirection: 'row', width: '100%', height: '100%' },
//     triangleOverlay: {
//         position: 'absolute',
//         transform: [{ rotate: '-90deg' }] // বই ৯০ ডিগ্রি ঘুরলে এটি সোজা হয়ে যাবে
//     },
//     pageLeftBase: { flex: 1, backgroundColor: '#FFF8DC', padding: 8, borderRightWidth: 1.5, borderRightColor: '#F0E5CF', justifyContent: 'center' },
//     pageRightBase: { flex: 1, backgroundColor: '#FFF8DC', padding: 8, justifyContent: 'center' },
//     flipCard: { position: 'absolute', left: '50%', width: PAGE_WIDTH, height: '100%' },
//     pageFace: { position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', backgroundColor: '#FEFBF3', padding: 8, justifyContent: 'center' },
//     pageFront: { borderLeftWidth: 1, borderLeftColor: '#F0E5CF' },
//     pageBack: { borderRightWidth: 1.5, borderRightColor: '#E8D2A6', backgroundColor: '#F9F5EB' },
//     shadowLine: { height: 2.5, backgroundColor: '#D7C0AE', marginBottom: 4, borderRadius: 2 },
//     logoTextRow: { flexDirection: 'row' },
//     brandText: { fontSize: 30, fontWeight: '900', letterSpacing: 1 },
//     stepsContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 15, height: 40 },
//     stepBox: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 },
//     stepText: { color: '#E0E0E0', fontSize: 14, fontWeight: '600', marginLeft: 6 },
//     stepDivider: { width: 1, height: 12, backgroundColor: '#444', marginHorizontal: 4 },
//     loaderBg: { width: 120, height: 3, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, overflow: 'hidden', position: 'absolute', bottom: 330 },
//     loaderFill: { width: 120, height: '100%', backgroundColor: GOLD, borderRadius: 10 },
//     svgContainer: { position: 'absolute', justifyContent: 'center', alignItems: 'center' },
// });

import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const GOLD = '#F3C623';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const BOOK_WIDTH = 110;
const PAGE_WIDTH = BOOK_WIDTH / 2;
const CIRCLE_RADIUS = 35;
const CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

export default function AppIntro({ onFinish }) {
    const bookFlip = useRef(new Animated.Value(0)).current;
    const writingVibe = useRef(new Animated.Value(0)).current;
    const smokeTrigger = useRef(new Animated.Value(0)).current;
    const loaderProgress = useRef(new Animated.Value(0)).current;
    const contentFade = useRef(new Animated.Value(0)).current;
    const AnimatedCircle = Animated.createAnimatedComponent(Circle);

    const readAnim = useRef(new Animated.Value(0)).current;
    const listenAnim = useRef(new Animated.Value(0)).current;
    const writeAnim = useRef(new Animated.Value(0)).current;

    const holeEffect = useRef(new Animated.Value(1)).current;
    const loaderFade = useRef(new Animated.Value(0)).current;
    
    // মিউজিক বারের জন্য এনিমেশন ভ্যালু
    const musicAnims = [useRef(new Animated.Value(0.3)).current, useRef(new Animated.Value(0.3)).current, useRef(new Animated.Value(0.3)).current, useRef(new Animated.Value(0.3)).current, useRef(new Animated.Value(0.3)).current];

    useEffect(() => {
        Animated.sequence([
            Animated.parallel([
                Animated.timing(bookFlip, { toValue: 1, duration: 3000, easing: Easing.bezier(0.4, 0, 0.2, 1), useNativeDriver: true }),
                Animated.timing(smokeTrigger, { toValue: 1, duration: 2500, useNativeDriver: true }),
                Animated.timing(contentFade, { toValue: 1, duration: 2000, useNativeDriver: true }),
                Animated.timing(writingVibe, { toValue: 1, duration: 2000, useNativeDriver: true }),

                Animated.sequence([
                    Animated.delay(700),
                    Animated.stagger(400, [
                        Animated.spring(readAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
                        Animated.spring(listenAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
                        Animated.spring(writeAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
                    ])
                ])
            ]),

            // আপনার অরিজিনাল holeEffect: আইকনগুলো মাঝখানে এসে ভ্যানিশ হবে
            Animated.timing(holeEffect, { toValue: 0, duration: 1200, easing: Easing.in(Easing.back(1)), useNativeDriver: true }),

            Animated.parallel([
                Animated.timing(loaderFade, { toValue: 1, duration: 400, useNativeDriver: true }),
                Animated.timing(loaderProgress, { toValue: 1, duration: 1500, easing: Easing.out(Easing.quad), useNativeDriver: true })
            ]),
        ]).start(() => {
            setTimeout(() => { if (onFinish) onFinish(); }, 600);
        });

        // মিউজিক বার এনিমেশন লুপ (বইয়ের জায়গায় যেটা নাচবে)
        musicAnims.forEach((anim, i) => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(anim, { toValue: 1, duration: 300 + (i * 100), useNativeDriver: true }),
                    Animated.timing(anim, { toValue: 0.3, duration: 300 + (i * 50), useNativeDriver: true }),
                ])
            ).start();
        });
    }, []);

    const mainFlip = bookFlip.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-180deg'] });

    // হুবহু আপনার দেওয়া অরিজিনাল এনিমেশন স্টাইল (Hole Effect সহ)
    const getAnimatedStyle = (anim, index) => {
        const xOffset = index === 0 ? 60 : index === 2 ? -60 : 0;
        return {
            opacity: Animated.multiply(anim, holeEffect),
            transform: [
                { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [15, 0] }) },
                { translateY: holeEffect.interpolate({ inputRange: [0, 1], outputRange: [-60, 0] }) },
                { translateX: holeEffect.interpolate({ inputRange: [0, 1], outputRange: [xOffset, 0] }) },
                { scale: Animated.multiply(anim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }), holeEffect) }
            ]
        };
    };

    return (
        <View style={styles.splashContainer}>
            <Animated.View style={styles.mainWrapper}>
                
                <View style={styles.bookWrapper}>
                    {/* গোল্ডেন সার্কেল */}
                    <Animated.View style={[styles.svgContainer, {
                        transform: [{ translateX: writingVibe.interpolate({ inputRange: [0, 1], outputRange: [-2, 2] }) }]
                    }]}>
                        <Svg height="240" width="240" viewBox="0 0 100 100">
                            <AnimatedCircle cx="50" cy="50" r={CIRCLE_RADIUS} stroke={GOLD} strokeWidth="2.5" fill="transparent"
                                strokeDasharray={CIRCUMFERENCE}
                                strokeDashoffset={smokeTrigger.interpolate({ inputRange: [0, 1], outputRange: [CIRCUMFERENCE, 0] })}
                                strokeLinecap="round" rotation="-90" origin="50, 50"
                            />
                        </Svg>
                    </Animated.View>

                    {/* Audio Visualizer (বইয়ের জায়গায় লোডার আসার পর দেখা যাবে) */}
                    <Animated.View style={[styles.musicContainer, { opacity: loaderFade }]}>
                        {musicAnims.map((anim, i) => (
                            <Animated.View key={i} style={[styles.musicBar, { transform: [{ scaleY: anim }] }]} />
                        ))}
                    </Animated.View>

                    {/* মেইন বই (যা holeEffect এর সাথে মিলিয়ে যাবে) */}
                    <Animated.View style={[styles.bookBase, { 
                        opacity: holeEffect,
                        transform: [{ scale: holeEffect }]
                    }]}>
                        <Animated.View style={styles.innerContent}>
                            <View style={styles.pageLeftBase}>
                                {[40, 60, 30].map((w, i) => <View key={i} style={[styles.shadowLine, { width: `${w}%` }]} />)}
                            </View>
                            <View style={styles.pageRightBase}>
                                {[50, 35, 65, 80].map((w, i) => <View key={i} style={[styles.shadowLine, { width: `${w}%` }]} />)}
                            </View>
                            <Animated.View style={[styles.flipCard, {
                                transform: [{ perspective: 1000 }, { translateX: -PAGE_WIDTH / 2 }, { rotateY: mainFlip }, { translateX: PAGE_WIDTH / 2 }],
                                zIndex: bookFlip.interpolate({ inputRange: [0, 0.5, 0.51, 1], outputRange: [10, 10, 0, 0] })
                            }]}>
                                <View style={[styles.pageFace, styles.pageFront]}>
                                    {[60, 40, 70].map((w, i) => <View key={i} style={[styles.shadowLine, { width: `${w}%`, opacity: 0.5 }]} />)}
                                </View>
                                <View style={[styles.pageFace, styles.pageBack, { transform: [{ rotateY: '180deg' }] }]}>
                                    {[60, 50, 70, 30].map((w, i) => <View key={i} style={[styles.shadowLine, { width: `${w}%`, opacity: 0.7 }]} />)}
                                </View>
                            </Animated.View>
                        </Animated.View>
                    </Animated.View>
                </View>

                {/* লোগো এবং টেক্সট */}
                <Animated.View style={{ opacity: contentFade, marginTop: 30 }}>
                    <View style={styles.logoTextRow}>
                        <Text style={[styles.brandText, { color: '#fff' }]}>গল্প </Text>
                        <Text style={[styles.brandText, { color: GOLD }]}>জল্প</Text>
                    </View>
                </Animated.View>

                {/* স্টেপস এনিমেশন (আপনার অরিজিনাল এনিমেশন ও হোল ইফেক্ট সহ) */}
                <View style={styles.stepsContainer}>
                    <Animated.View style={[styles.stepBox, getAnimatedStyle(readAnim, 0)]}>
                        <MaterialCommunityIcons name="book-open-variant" size={20} color={GOLD} />
                        <Text style={styles.stepText}>পড়ুন</Text>
                    </Animated.View>
                    <Animated.View style={[styles.stepDivider, { opacity: Animated.multiply(listenAnim, holeEffect) }]} />
                    <Animated.View style={[styles.stepBox, getAnimatedStyle(listenAnim, 1)]}>
                        <Ionicons name="headset" size={18} color={GOLD} />
                        <Text style={styles.stepText}>শুনুন</Text>
                    </Animated.View>
                    <Animated.View style={[styles.stepDivider, { opacity: Animated.multiply(writeAnim, holeEffect) }]} />
                    <Animated.View style={[styles.stepBox, getAnimatedStyle(writeAnim, 2)]}>
                        <FontAwesome5 name="pen-nib" size={14} color={GOLD} />
                        <Text style={styles.stepText}>লিখুন</Text>
                    </Animated.View>
                </View>
            </Animated.View>

            {/* লোডার */}
            <Animated.View style={[styles.loaderBg, { opacity: loaderFade }]}>
                <Animated.View style={[styles.loaderFill, {
                    transform: [{ translateX: -60 }, { scaleX: loaderProgress }, { translateX: 60 }]
                }]} />
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    splashContainer: { flex: 1, backgroundColor: '#1c131e', justifyContent: 'center', alignItems: 'center' },
    mainWrapper: { alignItems: 'center', width: '100%' },
    bookWrapper: { position: 'relative', width: 240, height: 120, justifyContent: 'center', alignItems: 'center' },
    bookBase: { 
        width: BOOK_WIDTH, height: 85, borderRadius: 12, overflow: 'hidden', 
        backgroundColor: '#F7E6C4', position: 'absolute' 
    },
    musicContainer: { position: 'absolute', flexDirection: 'row', alignItems: 'center', height: 40 },
    musicBar: { width: 4, height: 40, backgroundColor: GOLD, marginHorizontal: 2, borderRadius: 10 },
    innerContent: { flexDirection: 'row', width: '100%', height: '100%' },
    pageLeftBase: { flex: 1, backgroundColor: '#FFF8DC', padding: 8, borderRightWidth: 1.5, borderRightColor: '#F0E5CF', justifyContent: 'center' },
    pageRightBase: { flex: 1, backgroundColor: '#FFF8DC', padding: 8, justifyContent: 'center' },
    flipCard: { position: 'absolute', left: '50%', width: PAGE_WIDTH, height: '100%' },
    pageFace: { position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', backgroundColor: '#FEFBF3', padding: 8, justifyContent: 'center' },
    pageFront: { borderLeftWidth: 1, borderLeftColor: '#F0E5CF' },
    pageBack: { borderRightWidth: 1.5, borderRightColor: '#E8D2A6', backgroundColor: '#F9F5EB' },
    shadowLine: { height: 2.5, backgroundColor: '#D7C0AE', marginBottom: 4, borderRadius: 2 },
    logoTextRow: { flexDirection: 'row' },
    brandText: { fontSize: 30, fontWeight: '900', letterSpacing: 1 },
    stepsContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 15, height: 40 },
    stepBox: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 },
    stepText: { color: '#E0E0E0', fontSize: 14, fontWeight: '600', marginLeft: 6 },
    stepDivider: { width: 1, height: 12, backgroundColor: '#444', marginHorizontal: 4 },
    loaderBg: { width: 120, height: 3, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, overflow: 'hidden', position: 'absolute', bottom: 330 },
    loaderFill: { width: 120, height: '100%', backgroundColor: GOLD, borderRadius: 10 },
    svgContainer: { position: 'absolute', justifyContent: 'center', alignItems: 'center' },
});