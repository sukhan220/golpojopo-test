

// SearchScreen.jsx
import { db } from "@/firebase";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from 'expo-router';
import { collection, doc, getDoc, onSnapshot, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function SearchScreen() {
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState([]);

  const navigation = useNavigation(); // ✅ add

  const handleBookPress = (item) => {
    // অডিও হলে details স্ক্রিনে যাবে
    navigation.navigate("details", { book: JSON.stringify(item) });
  };

  const handleKindlePress = (item) => {
    // ইবুক হলে রিডার স্ক্রিনে যাবে (তোমার playTrack থাকলে ব্যবহার করো)
    try {
      // যদি playTrack ডিফাইন্ড থাকে তখনই কল করবে (না থাকলে সমস্যা করবে না)
      if (typeof playTrack === "function") {
        playTrack(item);
      }
    } catch (e) {
      // ignore if not available
    }
    navigation.navigate("reader", { book: JSON.stringify(item) });
  };

  useEffect(() => {
    if (!searchText.trim()) {
      setResults([]);
      return;
    }

    let unsubscribes = [];
    let allResults = [];
    const keyword = searchText.trim().toLowerCase();

    const pushResults = (newItems) => {
      allResults = [...allResults, ...newItems];
      setResults([...allResults]);
    };

    // writer search
    const writerQ = query(collection(db, "writer"));
    const unsubWriter = onSnapshot(writerQ, (snap) => {
      snap.docs.forEach((writerDoc) => {
        const writerId = writerDoc.id;
        const writerName = writerDoc.data().bn;

        if (!writerName?.toLowerCase().includes(keyword)) return;

        // books by writer
        const bookQ = query(collection(db, "books"));
        const unsubBooks = onSnapshot(bookQ, (bookSnap) => {
          const audioItems = bookSnap.docs
            .filter((d) => d.data().writerId === writerId)
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
              type: "audio",
              writerName,
            }));
          pushResults(audioItems);
        });
        unsubscribes.push(unsubBooks);

        // shortStory by writer
        const shortQ = query(collection(db, "shortStory"));
        const unsubShort = onSnapshot(shortQ, (shortSnap) => {
          const ebookItems = shortSnap.docs
            .filter((d) => d.data().writerId === writerId)
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
              type: "ebook",
              writerName,
            }));
          pushResults(ebookItems);
        });
        unsubscribes.push(unsubShort);
      });
    });
    unsubscribes.push(unsubWriter);

    // books title search
    const booksQ = query(collection(db, "books"));
    const unsubBooksTitle = onSnapshot(booksQ, async (snap) => {
      const items = await Promise.all(
        snap.docs
          .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
          .filter((data) => data.title?.toLowerCase().includes(keyword))
          .map(async (data) => {
            let writerName = "";
            if (data.writerId) {
              const writerRef = doc(db, "writer", data.writerId);
              const writerDoc = await getDoc(writerRef);
              if (writerDoc.exists()) {
                writerName = writerDoc.data().bn;
              }
            }
            return { ...data, type: "audio", writerName };
          })
      );
      pushResults(items);
    });
    unsubscribes.push(unsubBooksTitle);

    // shortStory title search
    const shortQ2 = query(collection(db, "shortStory"));
    const unsubShortTitle = onSnapshot(shortQ2, async (snap) => {
      const items = await Promise.all(
        snap.docs
          .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
          .filter((data) => data.title?.toLowerCase().includes(keyword))
          .map(async (data) => {
            let writerName = "";
            if (data.writerId) {
              const writerRef = doc(db, "writer", data.writerId);
              const writerDoc = await getDoc(writerRef);
              if (writerDoc.exists()) {
                writerName = writerDoc.data().bn;
              }
            }
            return { ...data, type: "ebook", writerName };
          })
      );
      pushResults(items);
    });
    unsubscribes.push(unsubShortTitle);

    // voice search in books
    const voiceBooksQ = query(collection(db, "books"));
    const unsubVoiceBooks = onSnapshot(voiceBooksQ, async (snap) => {
      const items = await Promise.all(
        snap.docs
          .map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
            type: "audio",
          }))
          .filter((item) => item.voice && item.voice.toLowerCase().includes(keyword))
          .map(async (item) => {
            let writerName = "";
            if (item.writerId) {
              const writerRef = doc(db, "writer", item.writerId);
              const writerDoc = await getDoc(writerRef);
              if (writerDoc.exists()) {
                writerName = writerDoc.data().bn;
              }
            }
            return { ...item, writerName };
          })
      );
      pushResults(items);
    });
    unsubscribes.push(unsubVoiceBooks);

    // voice search in shortStory
    const voiceShortQ = query(collection(db, "shortStory"));
    const unsubVoiceShort = onSnapshot(voiceShortQ, async (snap) => {
      const items = await Promise.all(
        snap.docs
          .map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
            type: "ebook",
          }))
          .filter((item) => item.voice && item.voice.toLowerCase().includes(keyword))
          .map(async (item) => {
            let writerName = "";
            if (item.writerId) {
              const writerRef = doc(db, "writer", item.writerId);
              const writerDoc = await getDoc(writerRef);
              if (writerDoc.exists()) {
                writerName = writerDoc.data().bn;
              }
            }
            return { ...item, writerName };
          })
      );
      pushResults(items);
    });
    unsubscribes.push(unsubVoiceShort);

    return () => unsubscribes.forEach((u) => u());
  }, [searchText]);

  // ✅ Highlight function
  const highlightText = (text, keyword) => {
    if (!keyword) return <Text style={styles.itemText}>{text}</Text>;
    const regex = new RegExp(`(${keyword})`, "gi");
    const parts = text.split(regex);
    return (
      <Text style={styles.itemText}>
        {parts.map((part, i) =>
          part.toLowerCase() === keyword.toLowerCase() ? (
            <Text key={i} style={{ color: "yellow", fontWeight: "bold" }}>
              {part}
            </Text>
          ) : (
            <Text key={i}>{part}</Text>
          )
        )}
      </Text>
    );
  };

  const renderItem = ({ item }) => {
    const imageUri =
      (item.type === "audio" || item.type === "ebook") && item.artwork
        ? item.artwork
        : null;

    return (
      <TouchableOpacity
        style={styles.item}
        activeOpacity={0.8}
        onPress={() =>
          item.type === "audio" ? handleBookPress(item) : handleKindlePress(item)
        } // ✅ onPress এখানে
      >
        {imageUri && (
          <Image
            source={{ uri: imageUri }}
            style={{ width: 40, height: 40, borderRadius: 6, marginRight: 10 }}
          />
        )}

        {item.type === "audio" && (
          <Ionicons name="play-circle" size={22} color="gold" />
        )}
        {item.type === "ebook" && (
          <Ionicons name="book" size={22} color="gold" />
        )}

        <View style={{ marginLeft: 10 }}>
          {highlightText(item.title || "", searchText)}
          {item.writerName && (
            <Text style={{ color: "#aaa", fontSize: 13 }}>
              ✍️ {highlightText(item.writerName, searchText)}
            </Text>
          )}
          {item.voice && (
            <Text style={{ color: "#777", fontSize: 12 }}>
              🎙️ {highlightText(item.voice, searchText)}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search by writer, title or voice..."
        placeholderTextColor="#999"
        value={searchText}
        onChangeText={setSearchText}
      />
      <FlatList
        data={results}
        renderItem={renderItem}
        keyExtractor={(item) => item.id + item.type}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#000" },
  searchInput: {
    backgroundColor: "#222",
    color: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#333",
    borderRadius: 8,
    marginBottom: 8,
  },
  itemText: { color: "#fff", fontSize: 16 },
});
