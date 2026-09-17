import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    Modal,
    Pressable,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

import styles from "@/components/reader/Reader.style";


export default function BooklistModal({
  visible,
  setListVisible,
  newListName,
  setNewListName,
  library,
  parsedBook,
  createBooklist,
  addToBooklist,
  removeFromBooklist
}) {

  return (
    <Modal transparent visible={visible} animationType="slide">
      <Pressable
        style={styles.modalOverlay}
        onPress={() => setListVisible(false)}
      >
        <View style={styles.chapterSidebar}>

          <Text style={styles.chapterHeader}>
            Save to Booklist
          </Text>

          <View style={{ flexDirection: "row", marginBottom: 15 }}>

            <TextInput
              placeholder="New booklist name"
              value={newListName}
              onChangeText={setNewListName}
              style={[styles.input, { flex: 1 }]}
            />

            <TouchableOpacity
              onPress={async () => {
                if (!newListName.trim()) return;

                await createBooklist(newListName);
                setNewListName("");
              }}
              style={{
                marginLeft: 10,
                backgroundColor: "#6b4f2d",
                paddingHorizontal: 15,
                justifyContent: "center",
                borderRadius: 6
              }}
            >
              <Text style={{ color: "#fff" }}>
                Create
              </Text>
            </TouchableOpacity>

          </View>

          {Object.entries(library?.booklists || {}).map(([id, list]) => {

            const added = list.items.includes(parsedBook.id);

            return (
              <TouchableOpacity
                key={id}
                style={styles.chapterItem}
                onPress={() =>
                  added
                    ? removeFromBooklist(id, parsedBook.id)
                    : addToBooklist(id, parsedBook.id)
                }
              >
                <Text style={styles.chapterTitle}>
                  {list.title}
                </Text>

                <Ionicons
                  name={
                    added
                      ? "checkmark-circle"
                      : "add-circle-outline"
                  }
                  size={22}
                  color={added ? "#6b4f2d" : "gray"}
                />
              </TouchableOpacity>
            );
          })}

        </View>
      </Pressable>
    </Modal>
  );
}