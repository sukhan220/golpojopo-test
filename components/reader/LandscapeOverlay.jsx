import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import * as ScreenOrientation from 'expo-screen-orientation';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

const LandscapeOverlay = ({
  showOverlay,
  zoomActive,
  insets,
  currentLeafIndex,
  totalLeaves,
  currentPage,
  pages,
  GOLD,
  flipperRef,
  setCurrentPage,
  resetOverlayTimer,
  overlayTimer
}) => {
  if (!showOverlay || zoomActive) return null;

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'box-none' }}>
      
      {/* টপ বার: পোর্টেট মোডে ফেরার বাটন */}
      <View style={{ position: 'absolute', top: 20, left: 20, paddingTop: insets.top }}>
        <TouchableOpacity
          onPress={async () => {
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
            setTimeout(() => ScreenOrientation.unlockAsync(), 500);
          }}
          style={{
            backgroundColor: 'rgba(0,0,0,0.6)',
            width: 45, height: 45, borderRadius: 25,
            justifyContent: 'center', alignItems: 'center'
          }}
        >
          <Ionicons name="contract" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* বটম বার: প্রগ্রেস বার ও পাতার হিসেব */}
      <View style={{
        position: 'absolute', bottom: 40, left: '10%', right: '10%',
        backgroundColor: 'rgba(0,0,0,0.6)', padding: 20, borderRadius: 20,
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
          <Text style={{ color: 'white', fontSize: 13, fontWeight: '600' }}>
            Progress: {((currentLeafIndex / totalLeaves) * 100).toFixed(0)}%
          </Text>
          <Text style={{ color: 'white', fontSize: 13, fontWeight: '600' }}>
            Leaf: {currentLeafIndex} / {totalLeaves}
            <Text style={{ color: GOLD }}>{` (Page: ${currentPage + 1}${pages[currentPage + 1] ? '-' + (currentPage + 2) : ''})`}</Text>
          </Text>
        </View>

        {/* স্লাইডার কন্টেইনার */}
        <View style={{ width: '100%', height: 30, justifyContent: 'center' }}>
          
          {/* ইন্ডিকেটর দাগগুলো */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15, position: 'absolute', width: '100%', zIndex: 0 }}>
            {Array.from({ length: Math.min(totalLeaves, 30) }).map((_, i) => (
              <View key={i} style={{ width: 2, height: 10, backgroundColor: i < (currentLeafIndex - 1) ? GOLD : 'rgba(255,255,255,0.6)', borderRadius: 1 }} />
            ))}
          </View>

          <Slider
            style={{ width: '100%', height: 40, zIndex: 1 }}
            minimumValue={0}
            maximumValue={totalLeaves - 1}
            step={1}
            value={currentLeafIndex - 1}
            minimumTrackTintColor={GOLD}
            maximumTrackTintColor="rgba(255,255,255,0.3)"
            thumbTintColor="white"
            onSlidingStart={() => {
              if (overlayTimer.current) {
                clearTimeout(overlayTimer.current);
                overlayTimer.current = null;
              }
            }}
            onValueChange={resetOverlayTimer}
            onSlidingComplete={(value) => {
              const targetPage = value * 2;
              setCurrentPage(targetPage);
              if (flipperRef.current) flipperRef.current.goToPage(value);
              resetOverlayTimer();
            }}
          />
        </View>
      </View>
    </View>
  );
};

export default LandscapeOverlay;