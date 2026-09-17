import React, { useRef } from 'react';
import { Animated, Pressable } from 'react-native';

const BouncePressable = ({ children, onPress, style, activeOpacity = 0.95 }) => {
    // স্কেল ভ্যালু ১ থেকে শুরু হবে
    const scaleValue = useRef(new Animated.Value(1)).current;

    // যখন আঙুল বাটনের ওপর রাখা হবে
    const onPressIn = () => {
        Animated.spring(scaleValue, {
            toValue: activeOpacity, // হালকা ছোট হবে
            useNativeDriver: true,
        }).start();
    };

    // যখন আঙুল সরিয়ে নেওয়া হবে
    const onPressOut = () => {
        Animated.spring(scaleValue, {
            toValue: 1, // আবার আগের সাইজে ফিরবে
            friction: 4, // কতটুকু বাউন্স করবে
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    return (
        <>
            <Pressable
                onPress={onPress}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                style={style}
            >
                <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
                    {children}
                </Animated.View>
            </Pressable>
        </>
    );
};

export default BouncePressable;