

//AppIntro.jsx

import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const GOLD = '#F3C623';
const BOOK_WIDTH = 110;
const PAGE_WIDTH = BOOK_WIDTH / 2;
const CIRCLE_RADIUS = 35;
const CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const WAVE_MAX_SIZE = 240;

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
    
    // ১. Wave এনিমেশনের জন্য একটি নতুন ভ্যালু যোগ করা হলো
    const waveAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.parallel([
                Animated.timing(bookFlip, { toValue: 1, duration: 3000, easing: Easing.bezier(0.4, 0, 0.2, 1), useNativeDriver: true }),
                // Animated.timing(smokeTrigger, { toValue: 1, duration: 2500, useNativeDriver: true }),
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

            // ২. হোল ইফেক্ট শুরু হওয়ার পর, আমরা একটি সিকোয়েন্স তৈরি করবো
            Animated.parallel([
                // মেইন হোল ইফেক্ট (আইকন ভেতরে ঢোকা) আগের মতোই ১২০০ মিলি-সেকেন্ডে চলবে
                Animated.timing(holeEffect, { toValue: 0, duration: 1200, easing: Easing.in(Easing.back(1)), useNativeDriver: true }),
                
                // এখানে Wave এনিমেশনটাকে দেরি করে শুরু করার জন্য সিকোয়েন্স ব্যবহার করা হলো
                Animated.sequence([
                    // আপনি কতটুকু দেরি বা ডিলি (delay) করতে চান? 
                    // যেমন আমি ৫০০ মিলি-সেকেন্ড দেরি সেট করে দিচ্ছি:
                    Animated.delay(1100), 
                    
                    // দেরি হওয়ার পর Wave টা প্লে হবে
                    Animated.timing(waveAnim, { 
                        toValue: 1, 
                        duration: 1000, // Wave এর নিজের টাইম
                        easing: Easing.out(Easing.quad), 
                        useNativeDriver: true 
                    }),
                    
                ])
            ]),

            Animated.parallel([
                Animated.timing(loaderFade, { toValue: 1, duration: 400, useNativeDriver: true }),
                Animated.timing(loaderProgress, { toValue: 1, duration: 1000, easing: Easing.out(Easing.quad), useNativeDriver: true })
            ])
        ]).start(() => {
            setTimeout(() => { if (onFinish) onFinish(); }, 200);
        });
    }, []);

    const mainFlip = bookFlip.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-180deg'] });

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
                    <Animated.View style={[styles.svgContainer, {
                        transform: [{ translateX: writingVibe.interpolate({ inputRange: [0, 1], outputRange: [-2, 2] }) }]
                    }]}>
                        <Svg height={WAVE_MAX_SIZE} width={WAVE_MAX_SIZE} viewBox="0 0 100 100">
                            {/* ৩. Wave Circle: এখন এটি নতুন waveAnim ভ্যালু ব্যবহার করবে */}
                            <AnimatedCircle 
                                cx="50" cy="50" 
                                // waveAnim ০ থেকে ১ হওয়ার সময় ব্যাসার্ধ বাড়ে
                                r={waveAnim.interpolate({ inputRange: [0, 1], outputRange: [CIRCLE_RADIUS, CIRCLE_RADIUS + 25] })} 
                                stroke={GOLD} 
                                strokeWidth="1.5" 
                                fill="transparent"
                                // waveAnim ০ থেকে ১ হওয়ার সময় অপাসিটি ০ -> ০.৮ -> ০ হয়
                                opacity={waveAnim.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 0.8, 0] })}
                            />
                            
                            {/* Drawing Circle: যেটা smokeTrigger দিয়ে আঁকা হয় */}
                            <AnimatedCircle cx="50" cy="50" r={CIRCLE_RADIUS} stroke={GOLD} strokeWidth="2.5" fill="transparent"
                                strokeDasharray={CIRCUMFERENCE}
                                strokeDashoffset={smokeTrigger.interpolate({ inputRange: [0, 1], outputRange: [CIRCUMFERENCE, 0] })}
                                strokeLinecap="round" rotation="-90" origin="50, 50"
                            />
                        </Svg>
                    </Animated.View>

                    <View style={styles.bookBase}>
                        <View style={styles.pageLeftBase}>
                            {[40, 60, 30].map((w, i) => (
                                <Animated.View key={i} style={[styles.shadowLine, {
                                    width: `${w}%`,
                                    opacity: writingVibe.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
                                    transform: [{ scaleX: writingVibe }]
                                }]} />
                            ))}
                        </View>
                        <View style={styles.pageRightBase}>
                            {[50, 35, 65, 80].map((w, i) => (
                                <Animated.View key={i} style={[styles.shadowLine, {
                                    width: `${w}%`,
                                    opacity: writingVibe.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
                                    transform: [{ scaleX: writingVibe }]
                                }]} />
                            ))}
                        </View>
                        <Animated.View style={[styles.flipCard, {
                            transform: [{ perspective: 1000 }, { translateX: -PAGE_WIDTH / 2 }, { rotateY: mainFlip }, { translateX: PAGE_WIDTH / 2 }],
                            zIndex: bookFlip.interpolate({ inputRange: [0, 0.5, 0.51, 1], outputRange: [10, 10, 0, 0] })
                        }]}>
                            <View style={[styles.pageFace, styles.pageFront]}>
                                {[60, 40, 70].map((w, i) => <View key={i} style={[styles.shadowLine, { width: `${w}%`, opacity: 0.5 }]} />)}
                            </View>
                            <Animated.View style={[styles.pageFace, styles.pageBack, { transform: [{ rotateY: '180deg' }] }]}>
                                {[60, 50, 70, 30].map((w, i) => <View key={i} style={[styles.shadowLine, { width: `${w}%`, opacity: 0.7 }]} />)}
                            </Animated.View>
                        </Animated.View>
                    </View>
                </View>

                <Animated.View style={{ opacity: contentFade, marginTop: 30 }}>
                    <View style={styles.logoTextRow}>
                        <Text style={[styles.brandText, { color: '#fff' }]}>গল্প </Text>
                        <Text style={[styles.brandText, { color: GOLD }]}>জল্প</Text>
                    </View>
                </Animated.View>

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

            <Animated.View style={[styles.loaderBg, { opacity: loaderFade }]}>
                <Animated.View style={[styles.loaderFill, {
                    transform: [
                        { translateX: -60 },
                        { scaleX: loaderProgress },
                        { translateX: 60 }
                    ]
                }]} />
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    splashContainer: { flex: 1, backgroundColor: '#1c131e', justifyContent: 'center', alignItems: 'center' },
    mainWrapper: { alignItems: 'center', width: '100%' },
    bookWrapper: { position: 'relative' },
    bookBase: { width: BOOK_WIDTH, height: BOOK_WIDTH, flexDirection: 'row', backgroundColor: '#F7E6C4', borderRadius: 4, elevation: 15, padding: 1 },
    pageLeftBase: { flex: 1, backgroundColor: '#FFF8DC', borderTopLeftRadius: 4, borderBottomLeftRadius: 4, padding: 8, borderRightWidth: 1.5, borderRightColor: '#F0E5CF', justifyContent: 'center' },
    pageRightBase: { flex: 1, backgroundColor: '#FFF8DC', borderTopRightRadius: 4, borderBottomRightRadius: 4, padding: 8, justifyContent: 'center' },
    flipCard: { position: 'absolute', left: '50%', width: PAGE_WIDTH, height: '100%' },
    pageFace: { position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', backgroundColor: '#FEFBF3', padding: 8, justifyContent: 'center' },
    pageFront: { borderTopRightRadius: 4, borderBottomRightRadius: 4, borderLeftWidth: 1, borderLeftColor: '#F0E5CF' },
    pageBack: { borderTopLeftRadius: 4, borderBottomLeftRadius: 4, borderRightWidth: 1.5, borderRightColor: '#E8D2A6', backgroundColor: '#F9F5EB' },
    shadowLine: { height: 2.5, backgroundColor: '#D7C0AE', marginBottom: 4, borderRadius: 2 },
    logoTextRow: { flexDirection: 'row' },
    brandText: { fontSize: 30, fontWeight: '900', letterSpacing: 1 },
    stepsContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 15, height: 40 },
    stepBox: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 },
    stepText: { color: '#E0E0E0', fontSize: 14, fontWeight: '600', marginLeft: 6 },
    stepDivider: { width: 1, height: 12, backgroundColor: '#444', marginHorizontal: 4 },
    loaderBg: { width: 120, height: 3, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, overflow: 'hidden', position: 'absolute', bottom: 330 },
    loaderFill: { width: 120, height: '100%', backgroundColor: GOLD, borderRadius: 10 },
    svgContainer: {
        position: 'absolute', justifyContent: 'center', alignItems: 'center', zIndex: -1, top: -70,
        left: -70, right: -65, alignSelf: 'center'
    },

   
});