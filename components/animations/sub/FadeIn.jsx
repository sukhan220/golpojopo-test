import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

const FadeInView = ({ children, delay = 0, duration = 600, style }) => {
    // এনিমেশন ভ্যালু সেটআপ (শুরুতে ইনভিজিবল এবং ২০ পিক্সেল নিচে থাকবে)
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        // প্যারালাল এনিমেশন রান করা
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: duration,
                delay: delay,
                useNativeDriver: true, // পারফরম্যান্সের জন্য এটি মাস্ট
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: duration,
                delay: delay,
                useNativeDriver: true,
            }),
        ]).start();
    }, [fadeAnim, slideAnim, delay, duration]);

    return (
        <>
            <Animated.View
                style={[
                    style,
                    {
                        opacity: fadeAnim, // আবছা থেকে স্পষ্ট হবে
                        transform: [{ translateY: slideAnim }], // নিচে থেকে উপরে উঠবে
                    },
                ]}
            >
                {children}
            </Animated.View>
        </>
    );
};

export default FadeInView;