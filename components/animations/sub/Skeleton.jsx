import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

const SkeletonBase = ({ children, loading }) => {
    const shimmerOpacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        let animation;
        if (loading) {
            animation = Animated.loop(
                Animated.sequence([
                    Animated.timing(shimmerOpacity, {
                        toValue: 0.8,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(shimmerOpacity, {
                        toValue: 0.3,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ])
            );
            animation.start();
        }
        return () => animation?.stop();
    }, [loading]);

    // children হিসেবে আমরা opacity পাস করছি যাতে ভেতরের সব ভিউ একই এনিমেশন পায়
    return children(shimmerOpacity);
};

// ১. প্লেলিস্ট আইটেম অ্যানিমেশন
export const PlaylistSkeletonItem = ({ loading }) => (
    <>
        <SkeletonBase loading={loading}>
            {(opacity) => (
                <View style={styles.skeletonItemRow}>
                    <Animated.View style={[styles.skeletonThumb, { opacity }]} />
                    <View style={{ flex: 1, gap: 8 }}>
                        <Animated.View style={[styles.skeletonLine, { width: '70%', height: 14, opacity }]} />
                        <Animated.View style={[styles.skeletonLine, { width: '40%', height: 10, opacity }]} />
                    </View>
                    <Animated.View style={[styles.skeletonCircle, { opacity }]} />
                </View>
            )}
        </SkeletonBase>
    </>
);

// ২. বড় কার্ড অ্যানিমেশন (Header Card)
export const PlaylistHeaderSkeleton = ({ loading }) => (
    <>
        <SkeletonBase loading={loading}>
            {(opacity) => (
                <View style={{ alignItems: 'center', marginBottom: 30 }}>
                    <Animated.View style={[styles.skeletonCover, { opacity }]} />
                    <Animated.View style={[styles.skeletonLine, { width: '50%', height: 20, marginTop: 15, opacity }]} />
                    <Animated.View style={[styles.skeletonButton, { opacity }]} />
                </View>
            )}
        </SkeletonBase>
    </>
);

const styles = StyleSheet.create({
    skeletonItemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 12 },
    skeletonThumb: { width: 70, height: 45, borderRadius: 6, backgroundColor: '#222' },
    skeletonLine: { borderRadius: 4, backgroundColor: '#222' },
    skeletonCircle: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#222' },
    skeletonCover: { width: 160, height: 160, borderRadius: 12, backgroundColor: '#222' },
    skeletonButton: { width: 140, height: 45, borderRadius: 30, backgroundColor: '#222', marginTop: 20 },
});