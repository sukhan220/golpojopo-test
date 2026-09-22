// import * as Font from 'expo-font';
// import { useEffect, useState } from 'react';
// import {
//   Modal,
//   Pressable,
//   Text,
//   TouchableOpacity,
//   View
// } from 'react-native';

// const FontSelector = ({ selectedFont, onSelect }) => {

//   // const fonts = ['serif', 'sans-serif', 'monospace', 'AnekBangla', 'NotoSansBengali', 'Fancy'];
//   const fonts = [
//   'serif',
//   'Tiro Bangla',
//   'Anek Bangla',
//   'Noto Sans Bengali',
//   'Hind Siliguri'
// ];

//   const [visible, setVisible] = useState(false);
//   const [fontsLoaded, setFontsLoaded] = useState(false);

//  useEffect(() => {

//   async function loadFonts() {

//     await Font.loadAsync({
//       AnekBangla: require('../../assets/fonts/AnekBangla.ttf'),
//       TiroBangla: require('../../assets/fonts/TiroBangla-Regular.ttf'),
//       NotoSansBengali: require('../../assets/fonts/NotoSansBengali-Regular.ttf'),
//     });

//     setFontsLoaded(true);
//   }

//   loadFonts();

// }, []);

//   if (!fontsLoaded) return null;

//   return (
//     <View>
//       <TouchableOpacity
//         style={styles.selectorCompact}
//         onPress={() => setVisible(true)}
//       >
//         <Text style={styles.selectorText}>
//           {selectedFont} ⌄
//         </Text>
//       </TouchableOpacity>

//       <Modal transparent visible={visible} animationType="fade">
//         <Pressable
//           style={styles.modalOverlay}
//           onPress={() => setVisible(false)}
//         >
//           <View style={styles.modalContent}>

//             {fonts.map((font) => (
//               <TouchableOpacity
//                 key={font}
//                 style={styles.option}
//                 onPress={() => {
//                   onSelect(font);
//                   setVisible(false);
//                 }}
//               >
//                 <Text
//                   style={{
//                     fontFamily: font,
//                     fontSize: 16,
//                     color: '#3b2f1b',
//                   }}
//                 >
//                   {font}
//                 </Text>
//               </TouchableOpacity>
//             ))}

//           </View>
//         </Pressable>
//       </Modal>
//     </View>
//   );
// };

// export default FontSelector;

import * as Font from 'expo-font';
import { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const FontSelector = ({ selectedFont, onSelect }) => {
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

const styles = StyleSheet.create({
  selectorCompact: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d0c8b6',
    backgroundColor: '#fff8f0',
  },
  selectorText: {
    fontSize: 14,
    color: '#3b2f1b',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
});

export default FontSelector;