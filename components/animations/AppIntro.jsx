// // // // //AppIntro.jsx

// import { useEffect, useRef, useState } from 'react';
// import { Animated, Easing, Platform, StyleSheet, View } from 'react-native';
// import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

// const PAPER_DARK = '#2b2d2f'; 
// const PAPER_MID = '#4a4d50';
// const BG_COLOR = '#ffffff';

// const BENGALI_FONT = Platform.select({
//     ios: 'Hind Siliguri',
//     android: 'HindSiliguri-Bold',
// });

// const PATH_D = "M 50,230 Q 55,230 65,230 T 85,220 T 100,230 T 115,220 T 130,235 T 145,210 T 160,260 C 180,290 200,150 220,110 C 250,70 310,60 350,90 L 350,310 C 310,320 270,310 205,350 C 150,330 110,310 40,310 L 40,90 C 80,60 140,50 210,100";

// const AnimatedPath = Animated.createAnimatedComponent(Path);

// const BRAND_TEXT = "গল্পজল্প";
// const TAGLINE_TEXT = "Read • Listen • Write";

// export default function AppIntro({ onFinish }) {
//     const pathRef = useRef(null);
//     const [pathLength, setPathLength] = useState(1500);
//     const [isSvgReady, setIsSvgReady] = useState(false);

//     const strokeDashoffset = useRef(new Animated.Value(1500)).current;

//     const brandAnim = useRef(new Animated.Value(0)).current;
//     const taglineCharAnims = useRef(TAGLINE_TEXT.split('').map(() => new Animated.Value(0))).current;

//     const loaderFade = useRef(new Animated.Value(0)).current;
//     const loaderProgress = useRef(new Animated.Value(0)).current;

//     const handleLayout = () => {
//         if (pathRef.current && pathRef.current.getTotalLength) {
//             const totalLen = pathRef.current.getTotalLength();
//             if (totalLen && totalLen > 0) {
//                 setPathLength(totalLen);
//                 strokeDashoffset.setValue(totalLen);
//             }
//         }
//         setIsSvgReady(true);
//     };

//     useEffect(() => {
//         if (!isSvgReady) return;

//         const strokeTimer = setTimeout(() => {
//             Animated.timing(strokeDashoffset, {
//                 toValue: 0,
//                 duration: 4000,
//                 easing: Easing.inOut(Easing.ease),
//                 useNativeDriver: true,
//             }).start();
//         }, 500);

//         const triggerTime = 2500;

//         const mainTimer = setTimeout(() => {
//             Animated.timing(brandAnim, {
//                 toValue: 1,
//                 duration: 600,
//                 easing: Easing.out(Easing.ease),
//                 useNativeDriver: true,
//             }).start();

//             setTimeout(() => {
//                 const taglineAnimations = taglineCharAnims.map((anim) =>
//                     Animated.timing(anim, {
//                         toValue: 1,
//                         duration: 400,
//                         easing: Easing.out(Easing.ease),
//                         useNativeDriver: true,
//                     })
//                 );
//                 Animated.stagger(40, taglineAnimations).start();
//             }, 600);

//             Animated.timing(loaderFade, {
//                 toValue: 1,
//                 duration: 800,
//                 useNativeDriver: true,
//             }).start();

//             setTimeout(() => {
//                 Animated.timing(loaderProgress, {
//                     toValue: 1,
//                     duration: 3000,
//                     easing: Easing.bezier(0.1, 0.5, 0.5, 1),
//                     useNativeDriver: true,
//                 }).start(() => {
//                     if (onFinish) {
//                         setTimeout(onFinish, 300);
//                     }
//                 });
//             }, 300);

//         }, triggerTime);

//         return () => {
//             clearTimeout(strokeTimer);
//             clearTimeout(mainTimer);
//         };
//     }, [isSvgReady]);

//     return (
//         <View style={styles.container}>
//             <View style={styles.mainWrapper}>
//                 <View style={styles.logoRowContainer}>
//                     <View style={{ opacity: isSvgReady ? 1 : 0 }}>
//                         <Svg viewBox="0 0 400 400" style={styles.svg}>
//                             <Defs>
//                                 <LinearGradient id="paperGrad" x1="0%" y1="0%" x2="100%" y2="100%">
//                                     <Stop offset="0%" stopColor={PAPER_DARK} stopOpacity="1" />
//                                     <Stop offset="100%" stopColor={PAPER_MID} stopOpacity="1" />
//                                 </LinearGradient>
//                             </Defs>
//                             <AnimatedPath
//                                 ref={pathRef}
//                                 onLayout={handleLayout}
//                                 d={PATH_D}
//                                 fill="none"
//                                 stroke="url(#paperGrad)"
//                                 strokeWidth="12"
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                                 strokeDasharray={pathLength}
//                                 strokeDashoffset={strokeDashoffset}
//                             />
//                         </Svg>
//                     </View>

//                     <View style={styles.textGroup}>
//                         <Animated.Text
//                             style={[
//                                 styles.brandNameText,
//                                 {
//                                     opacity: brandAnim,
//                                     transform: [
//                                         {
//                                             translateY: brandAnim.interpolate({
//                                                 inputRange: [0, 1],
//                                                 outputRange: [8, 0],
//                                             }),
//                                         },
//                                     ],
//                                 },
//                             ]}
//                         >
//                             {BRAND_TEXT}
//                         </Animated.Text>

//                         <View style={styles.charRow}>
//                             {TAGLINE_TEXT.split('').map((char, index) => {
//                                 const anim = taglineCharAnims[index];
//                                 return (
//                                     <Animated.Text
//                                         key={index}
//                                         style={[
//                                             styles.taglineChar,
//                                             {
//                                                 opacity: anim,
//                                                 transform: [
//                                                     {
//                                                         translateY: anim.interpolate({
//                                                             inputRange: [0, 1],
//                                                             outputRange: [8, 0],
//                                                         }),
//                                                     },
//                                                 ],
//                                             },
//                                         ]}
//                                     >
//                                         {char === ' ' ? '\u00A0' : char}
//                                     </Animated.Text>
//                                 );
//                             })}
//                         </View>
//                     </View>
//                 </View>

//                 <Animated.View style={[styles.loadingSection, { opacity: loaderFade }]}>
//                     <View style={styles.loaderBarBg}>
//                         <Animated.View
//                             style={[
//                                 styles.loaderBarFill,
//                                 {
//                                     transform: [
//                                         {
//                                             translateX: loaderProgress.interpolate({
//                                                 inputRange: [0, 1],
//                                                 outputRange: [-240, 0],
//                                             }),
//                                         },
//                                     ],
//                                 },
//                             ]}
//                         />
//                     </View>
//                 </Animated.View>
//             </View>
//         </View>
//     );
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: BG_COLOR,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     mainWrapper: {
//         alignItems: 'center',
//         justifyContent: 'center',
//         marginBottom: 60, // পুরো সিস্টেমকে স্ক্রিনের কিছুটা উপরে শিফট করার জন্য
//     },
//     logoRowContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'center',
//         gap: 16,
//     },
//     svg: {
//         width: 110,
//         height: 110,
//         overflow: 'visible',
//     },
//     textGroup: {
//         flexDirection: 'column',
//         alignItems: 'flex-start',
//         justifyContent: 'center',
//     },
//     charRow: {
//         flexDirection: 'row',
//     },
//     brandNameText: {
//         fontSize: 32,
//         fontWeight: 'bold',
//         fontFamily: BENGALI_FONT,
//         color: PAPER_DARK,
//         lineHeight: 40,
//         includeFontPadding: false,
//     },
//     taglineChar: {
//         fontSize: 10,
//         fontWeight: '400',
//         color: PAPER_MID,
//         letterSpacing: 2,
//         marginTop: 2,
//         marginLeft: 1,
//         textTransform: 'uppercase',
//     },
//     loadingSection: {
//         width: 240,
//         marginTop: 14,
//         alignSelf: 'center',
//     },
//     loaderBarBg: {
//         width: '100%',
//         height: 2,
//         backgroundColor: 'rgba(43, 45, 47, 0.12)',
//         borderRadius: 4,
//         overflow: 'hidden',
//     },
//     loaderBarFill: {
//         width: '100%',
//         height: '100%',
//         backgroundColor: PAPER_DARK,
//         borderRadius: 4,
//     },
// });

import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

const PAPER_DARK = '#2b2d2f'; 
const PAPER_MID = '#4a4d50';
const BG_COLOR = '#ffffff';

const BENGALI_FONT = Platform.select({
    ios: 'Hind Siliguri',
    android: 'HindSiliguri-Bold',
});

const PATH_D = "M 50,230 Q 55,230 65,230 T 85,220 T 100,230 T 115,220 T 130,235 T 145,210 T 160,260 C 180,290 200,150 220,110 C 250,70 310,60 350,90 L 350,310 C 310,320 270,310 205,350 C 150,330 110,310 40,310 L 40,90 C 80,60 140,50 210,100";

const AnimatedPath = Animated.createAnimatedComponent(Path);

const BRAND_TEXT = "গল্পজল্প";

export default function AppIntro({ onFinish }) {
    const pathRef = useRef(null);
    const [pathLength, setPathLength] = useState(1500);
    const [isSvgReady, setIsSvgReady] = useState(false);

    const strokeDashoffset = useRef(new Animated.Value(1500)).current;

    const brandAnim = useRef(new Animated.Value(0)).current;
    const loaderFade = useRef(new Animated.Value(0)).current;
    const loaderProgress = useRef(new Animated.Value(0)).current;

    const handleLayout = () => {
        if (pathRef.current && pathRef.current.getTotalLength) {
            const totalLen = pathRef.current.getTotalLength();
            if (totalLen && totalLen > 0) {
                setPathLength(totalLen);
                strokeDashoffset.setValue(totalLen);
            }
        }
        setIsSvgReady(true);
    };

    useEffect(() => {
        if (!isSvgReady) return;

        const strokeTimer = setTimeout(() => {
            Animated.timing(strokeDashoffset, {
                toValue: 0,
                duration: 4000,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
            }).start();
        }, 500);

        const triggerTime = 2500;

        const mainTimer = setTimeout(() => {
            Animated.timing(brandAnim, {
                toValue: 1,
                duration: 600,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }).start();

            Animated.timing(loaderFade, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }).start();

            setTimeout(() => {
                Animated.timing(loaderProgress, {
                    toValue: 1,
                    duration: 3000,
                    easing: Easing.bezier(0.1, 0.5, 0.5, 1),
                    useNativeDriver: true,
                }).start(() => {
                    if (onFinish) {
                        setTimeout(onFinish, 300);
                    }
                });
            }, 300);

        }, triggerTime);

        return () => {
            clearTimeout(strokeTimer);
            clearTimeout(mainTimer);
        };
    }, [isSvgReady]);

    return (
        <View style={styles.container}>
            <View style={styles.mainWrapper}>
                {/* ১. লোগো */}
                <View style={{ opacity: isSvgReady ? 1 : 0 }}>
                    <Svg viewBox="0 0 400 400" style={styles.svg}>
                        <Defs>
                            <LinearGradient id="paperGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <Stop offset="0%" stopColor={PAPER_DARK} stopOpacity="1" />
                                <Stop offset="100%" stopColor={PAPER_MID} stopOpacity="1" />
                            </LinearGradient>
                        </Defs>
                        <AnimatedPath
                            ref={pathRef}
                            onLayout={handleLayout}
                            d={PATH_D}
                            fill="none"
                            stroke="url(#paperGrad)"
                            strokeWidth="12"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeDasharray={pathLength}
                            strokeDashoffset={strokeDashoffset}
                        />
                    </Svg>
                </View>

                {/* ২. ব্র্যান্ড নেম */}
                <Animated.Text
                    style={[
                        styles.brandNameText,
                        {
                            opacity: brandAnim,
                            transform: [
                                {
                                    translateY: brandAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [6, 0],
                                    }),
                                },
                            ],
                        },
                    ]}
                >
                    {BRAND_TEXT}
                </Animated.Text>

                {/* ৩. লোডার বার */}
                <Animated.View style={[styles.loadingSection, { opacity: loaderFade }]}>
                    <View style={styles.loaderBarBg}>
                        <Animated.View
                            style={[
                                styles.loaderBarFill,
                                {
                                    transform: [
                                        {
                                            translateX: loaderProgress.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [-160, 0],
                                            }),
                                        },
                                    ],
                                },
                            ]}
                        />
                    </View>
                </Animated.View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BG_COLOR,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mainWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 80, // স্ক্রিনের আরো একটু উপরে সেন্টারে শিফট করার জন্য বাড়ানো হয়েছে
    },
    svg: {
        width: 120,
        height: 120,
        overflow: 'visible',
    },
    brandNameText: {
        fontSize: 26,
        fontWeight: 'bold',
        fontFamily: BENGALI_FONT,
        color: PAPER_DARK,
        textAlign: 'center',
        marginTop: -2,
        includeFontPadding: false,
    },
    loadingSection: {
        width: 160,
        marginTop: 8,
        alignSelf: 'center',
    },
    loaderBarBg: {
        width: '100%',
        height: 2,
        backgroundColor: 'rgba(43, 45, 47, 0.12)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    loaderBarFill: {
        width: '100%',
        height: '100%',
        backgroundColor: PAPER_DARK,
        borderRadius: 4,
    },
});