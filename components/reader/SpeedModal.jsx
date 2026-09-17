import Slider from "@react-native-community/slider";
import React from "react";
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

export default function SpeedModal({
  visible,
  speedX,
  setSpeedX,
  setAutoScrollSpeed,
  onClose
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { width: 260 }]}>

          <Text style={styles.title}>
            Auto Scroll Speed
          </Text>

          <Slider
            minimumValue={1}
            maximumValue={2}
            step={0.05}
            value={speedX}
            onValueChange={(val) => {
              const rounded = Number(val.toFixed(2));
              setSpeedX(rounded);
              setAutoScrollSpeed(0.2 * rounded);
            }}
            minimumTrackTintColor="#6b4f2d"
            maximumTrackTintColor="#ccc"
          />

          <TouchableOpacity
            onPress={onClose}
            style={styles.doneBtn}
          >
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
  },

  title: {
    fontWeight: "bold",
    marginBottom: 10,
    color: "#6b4f2d",
  },

  doneBtn: {
    alignSelf: "flex-end",
    marginTop: 10,
  },

  doneText: {
    color: "#6b4f2d",
  },

});