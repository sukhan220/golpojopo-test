

// // components/animations/HomeSkeleton.jsx

// import React, { useEffect, useRef } from 'react';
// import { Animated, Dimensions, ScrollView, StyleSheet, View } from 'react-native';

// const { width } = Dimensions.get('window');

// const SkeletonBase = ({ children, loading }) => {
//     const shimmerOpacity = useRef(new Animated.Value(0.3)).current;

//     useEffect(() => {
//         let animation;
//         if (loading) {
//             animation = Animated.loop(
//                 Animated.sequence([
//                     Animated.timing(shimmerOpacity, {
//                         toValue: 0.6,
//                         duration: 800,
//                         useNativeDriver: true,
//                     }),
//                     Animated.timing(shimmerOpacity, {
//                         toValue: 0.3,
//                         duration: 800,
//                         useNativeDriver: true,
//                     }),
//                 ])
//             );
//             animation.start();
//         }
//         return () => animation?.stop();
//     }, [loading]);

//     return children(shimmerOpacity);
// };

// const HomeSkeleton = ({ loading }) => {
//     if (!loading) return null;

//     return (
//         <ScrollView 
//             style={styles.container} 
//             contentContainerStyle={styles.contentContainer} // এরর ফিক্স করতে এটি যোগ করা হয়েছে
//             showsVerticalScrollIndicator={false}
//         >
//             <SkeletonBase loading={loading}>
//                 {(opacity) => (
//                     <View>
//                         {/* ১. হেডার ও সার্চ আইকন এরিয়া */}
//                         <View style={[styles.row, { justifyContent: 'space-between', marginTop: 20 }]}>
//                             <Animated.View style={[styles.titleSkeleton, { width: '30%', opacity }]} />
//                             <Animated.View style={[styles.circle, { width: 30, height: 30, opacity }]} />
//                         </View>

//                         {/* ২. ক্যাটাগরি চিপস */}
//                         <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
//                             {[1, 2, 3].map((i) => (
//                                 <Animated.View key={i} style={[styles.categoryChip, { opacity }]} />
//                             ))}
//                         </ScrollView>

//                         {/* ৩. My Library সেকশন */}
//                         <Animated.View style={[styles.titleSkeleton, { width: '35%', marginTop: 20, opacity }]} />
//                         <View style={styles.libraryGrid}>
//                             {[1, 2, 3, 4].map((i) => (
//                                 <Animated.View key={i} style={[styles.libraryBox, { opacity }]} />
//                             ))}
//                         </View>

//                         {/* ৪. AudioBooks সেকশন */}
//                         <Animated.View style={[styles.titleSkeleton, { width: '40%', marginTop: 10, opacity }]} />
//                         <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
//                             {[1, 2, 3].map((i) => (
//                                 <View key={i} style={styles.bookContainer}>
//                                     <Animated.View style={[styles.bookCover, { opacity }]} />
//                                     <Animated.View style={[styles.line, { width: '80%', marginTop: 12, opacity }]} />
//                                     <Animated.View style={[styles.line, { width: '50%', marginTop: 8, opacity }]} />
//                                 </View>
//                             ))}
//                         </ScrollView>

//                         {/* ৫. Books সেকশন */}
//                         <Animated.View style={[styles.titleSkeleton, { width: '30%', marginTop: 25, opacity }]} />
//                         <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
//                             {[1, 2, 3].map((i) => (
//                                 <View key={i} style={styles.bookContainer}>
//                                     <Animated.View style={[styles.bookCover, { opacity }]} />
//                                     <Animated.View style={[styles.line, { width: '70%', marginTop: 12, opacity }]} />
//                                 </View>
//                             ))}
//                         </ScrollView>
//                     </View>
//                 )}
//             </SkeletonBase>
//         </ScrollView>
//     );
// };

// export default HomeSkeleton;

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#1c131e',
//     },
//     contentContainer: { // ScrollView এর ভেতরের প্যাডিং এখানে থাকবে
//         paddingHorizontal: 20,
//         paddingBottom: 40,
//     },
//     row: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginBottom: 15,
//         gap: 12,
//     },
//     titleSkeleton: {
//         height: 24,
//         borderRadius: 6,
//         backgroundColor: '#3a2c42',
//         marginBottom: 15,
//     },
//     categoryChip: {
//         width: 130,
//         height: 50,
//         borderRadius: 10,
//         backgroundColor: '#3a2c42',
//     },
//     libraryGrid: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         marginBottom: 25,
//     },
//     libraryBox: {
//         width: (width - 70) / 4,
//         height: 75,
//         borderRadius: 12,
//         backgroundColor: '#3a2c42',
//     },
//     bookContainer: {
//         marginRight: 15,
//         width: 130,
//     },
//     bookCover: {
//         width: 130,
//         height: 130,
//         borderRadius: 15,
//         backgroundColor: '#3a2c42',
//     },
//     line: {
//         height: 14,
//         borderRadius: 4,
//         backgroundColor: '#3a2c42',
//     },
//     circle: {
//         borderRadius: 50,
//         backgroundColor: '#3a2c42',
//     }
// });

import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

const { width, height } = Dimensions.get('window');

const HomeSkeleton = ({ loading }) => {
    const shimmerOpacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        if (loading) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(shimmerOpacity, {
                        toValue: 0.6,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                    Animated.timing(shimmerOpacity, {
                        toValue: 0.3,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        }
    }, [loading]);

    if (!loading) return null;

    // কমন অ্যানিমেটেড স্টাইল
    const animatedStyle = { opacity: shimmerOpacity };

    return (
        <View style={styles.fullScreenOverlay}>
            {/* ১. হেডার এরিয়া */}
            <View style={[styles.row, { justifyContent: 'space-between', marginTop: 20 }]}>
                <Animated.View style={[styles.titleSkeleton, { width: '30%' }, animatedStyle]} />
                <Animated.View style={[styles.circle, { width: 35, height: 35 }, animatedStyle]} />
            </View>

            {/* ২. ক্যাটাগরি চিপস (Horizontal Row without ScrollView) */}
            <View style={styles.row}>
                {[1, 2, 3].map((i) => (
                    <Animated.View key={i} style={[styles.categoryChip, animatedStyle]} />
                ))}
            </View>

            {/* ৩. My Library সেকশন */}
            <Animated.View style={[styles.titleSkeleton, { width: '40%', marginTop: 10 }, animatedStyle]} />
            <View style={styles.libraryGrid}>
                {[1, 2, 3, 4].map((i) => (
                    <Animated.View key={i} style={[styles.libraryBox, animatedStyle]} />
                ))}
            </View>

            {/* ৪. AudioBooks সেকশন */}
            <Animated.View style={[styles.titleSkeleton, { width: '45%' }, animatedStyle]} />
            <View style={styles.row}>
                {[1, 2].map((i) => (
                    <View key={i} style={styles.bookContainer}>
                        <Animated.View style={[styles.bookCover, animatedStyle]} />
                        <Animated.View style={[styles.line, { width: '80%', marginTop: 12 }, animatedStyle]} />
                        <Animated.View style={[styles.line, { width: '50%', marginTop: 8 }, animatedStyle]} />
                    </View>
                ))}
            </View>

            {/* ৫. Books সেকশন (নিচের অংশ) */}
            <Animated.View style={[styles.titleSkeleton, { width: '35%', marginTop: 20 }, animatedStyle]} />
            <View style={styles.row}>
                {[1, 2].map((i) => (
                    <View key={i} style={styles.bookContainer}>
                        <Animated.View style={[styles.bookCover, animatedStyle]} />
                        <Animated.View style={[styles.line, { width: '70%', marginTop: 12 }, animatedStyle]} />
                    </View>
                ))}
            </View>
        </View>
    );
};

export default HomeSkeleton;

const styles = StyleSheet.create({
    fullScreenOverlay: {
        // স্ক্রিনের পুরোটা দখল করবে কিন্তু স্ক্রল হবে না
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#1c131e',
        paddingHorizontal: 20,
        zIndex: 1000,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 12,
    },
    titleSkeleton: {
        height: 22,
        borderRadius: 6,
        backgroundColor: '#3a2c42',
        marginBottom: 10,
    },
    categoryChip: {
        flex: 1, // Row এর ভেতর সমান জায়গা নিতে
        height: 45,
        borderRadius: 12,
        backgroundColor: '#3a2c42',
    },
    libraryGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    libraryBox: {
        width: (width - 70) / 4,
        height: 75,
        borderRadius: 15,
        backgroundColor: '#3a2c42',
    },
    bookContainer: {
        flex: 1,
        maxWidth: width * 0.4,
    },
    bookCover: {
        width: '100%',
        aspectRatio: 1, // স্কয়ার শেপ নিশ্চিত করতে
        borderRadius: 18,
        backgroundColor: '#3a2c42',
    },
    line: {
        height: 12,
        borderRadius: 4,
        backgroundColor: '#3a2c42',
    },
    circle: {
        borderRadius: 50,
        backgroundColor: '#3a2c42',
    }
});