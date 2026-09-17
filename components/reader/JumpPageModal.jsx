// import styles from '@/components/reader/Reader.style';
// import React, { useState } from 'react';
// import { Modal, Pressable, Text, TextInput, TouchableOpacity, View } from 'react-native';

// export default function JumpPageModal({ visible, onClose, pagesLength, onJump }) {
//   const [input, setInput] = useState('');

//   const handleGo = () => {
//     const p = Number(input) - 1;
//     if (p >= 0 && p < pagesLength) {
//       onJump(p);
//     }
//     setInput('');
//     onClose();
//   };

//   return (
//     <Modal transparent visible={visible} animationType="fade">
//       <Pressable style={styles.modalOverlay} onPress={onClose}>
//         <View style={styles.popupSmall}>
//           <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>পৃষ্ঠায় যান</Text>
//           <TextInput
//             style={styles.input}
//             keyboardType="number-pad"
//             placeholder="পৃষ্ঠা নম্বর লিখুন"
//             autoFocus
//             value={input}
//             onChangeText={setInput}
//           />
//           <TouchableOpacity style={styles.goBtn} onPress={handleGo}>
//             <Text style={{ color: '#1b1a1a', fontWeight: 'bold' }}>Go</Text>
//           </TouchableOpacity>
//         </View>
//       </Pressable>
//     </Modal>
//   );
// }

import styles from '@/components/reader/Reader.style';
import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function JumpPageModal({ visible, onClose, pagesLength, onJump }) {

  const [input, setInput] = useState('');

  const handleGo = () => {
    const p = Number(input) - 1;

    if (p >= 0 && p < pagesLength) {
      onJump(p);
    }

    setInput('');
    onClose();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
    >

      <Pressable style={styles.jumpOverlay} onPress={onClose}>

        <View style={styles.jumpBox}>

          <Text style={styles.jumpTitle}>
            Go To Page
          </Text>

          <Text style={styles.jumpSubtitle}>
            Total Page: {pagesLength}
          </Text>

          <TextInput
            style={styles.jumpInput}
            keyboardType="number-pad"
            placeholder="Page Number"
            autoFocus
            value={input}
            onChangeText={setInput}
          />

          <View style={styles.jumpButtons}>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
            >
              <Text style={styles.cancelText}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.jumpBtn}
              onPress={handleGo}
            >
              <Text style={styles.jumpBtnText}>
                GO
              </Text>
            </TouchableOpacity>

          </View>

        </View>

      </Pressable>

    </Modal>
  );
}