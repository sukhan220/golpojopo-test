import * as Font from 'expo-font';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const FontSelector = ({ selectedFont, onSelect }) => {

  // const fonts = ['serif', 'sans-serif', 'monospace', 'AnekBangla', 'NotoSansBengali', 'Fancy'];
  const fonts = [
  'serif',
  'Tiro Bangla',
  'Anek Bangla',
  'Noto Sans Bengali',
  'Hind Siliguri'
];

  const [visible, setVisible] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);

 useEffect(() => {

  async function loadFonts() {

    await Font.loadAsync({
      AnekBangla: require('../../assets/fonts/AnekBangla.ttf'),
      TiroBangla: require('../../assets/fonts/TiroBangla-Regular.ttf'),
      NotoSansBengali: require('../../assets/fonts/NotoSansBengali-Regular.ttf'),
    });

    setFontsLoaded(true);
  }

  loadFonts();

}, []);

  if (!fontsLoaded) return null;

  return (
    <View>
      <TouchableOpacity
        style={styles.selectorCompact}
        onPress={() => setVisible(true)}
      >
        <Text style={styles.selectorText}>
          {selectedFont} ⌄
        </Text>
      </TouchableOpacity>

      <Modal transparent visible={visible} animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setVisible(false)}
        >
          <View style={styles.modalContent}>

            {fonts.map((font) => (
              <TouchableOpacity
                key={font}
                style={styles.option}
                onPress={() => {
                  onSelect(font);
                  setVisible(false);
                }}
              >
                <Text
                  style={{
                    fontFamily: font,
                    fontSize: 16,
                    color: '#3b2f1b',
                  }}
                >
                  {font}
                </Text>
              </TouchableOpacity>
            ))}

          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default FontSelector;