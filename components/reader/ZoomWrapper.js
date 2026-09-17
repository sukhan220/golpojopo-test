import { StyleSheet, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";



export default function ZoomWrapper({ children,onZoomChange }) {
  const { width, height } = useWindowDimensions();

  const scale = useSharedValue(1);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const startScale = useSharedValue(1);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const clamp = (v, min, max) => {
    "worklet";
    return Math.min(max, Math.max(min, v));
  };

  const updateZoomState = (isZoomed) => {
    "worklet";
    if (onZoomChange) {
      runOnJS(onZoomChange)(isZoomed); // Worklet থেকে JS থ্রেডে ডেটা পাঠানো
    }
  };

  const pinch = Gesture.Pinch()
    .onStart(() => {
      startScale.value = scale.value;
    })
    .onUpdate((e) => {
      const next = startScale.value * e.scale;
      scale.value = clamp(next, 1, 3);
      updateZoomState(scale.value > 1.05);
    })
    .onEnd(() => {
      if (scale.value < 1) {
        scale.value = withTiming(1);
        updateZoomState(false);
      }
    });

  const pan = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate((e) => {
      if (scale.value <= 1) return;

      const maxX = (width * scale.value - width) / 2;
      const maxY = (height * scale.value - height) / 2;

      translateX.value = clamp(
        startX.value + e.translationX,
        -maxX,
        maxX
      );

      translateY.value = clamp(
        startY.value + e.translationY,
        -maxY,
        maxY
      );
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd((e) => {
      if (scale.value > 1) {
        scale.value = withTiming(1);
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
        updateZoomState(false);
      } else {
        scale.value = withTiming(2);
        updateZoomState(true);

        translateX.value = withTiming(
          -(e.x - width / 2)
        );

        translateY.value = withTiming(
          -(e.y - height / 2)
        );
      }
    });

  const composed = Gesture.Simultaneous(
    pinch,
    pan,
    doubleTap
  );

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
    };
  });

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[styles.container, animatedStyle]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
