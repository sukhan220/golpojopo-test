

// book.jsx
import { Colors } from '@/constants/Colors';
import { db } from '@/firebase';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Appearance,
    FlatList,
    Image,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const colorScheme = Appearance.getColorScheme();
const themes = colorScheme === 'dark' ? Colors.dark : Colors.light;


export default function BookScreen() {
    const router = useRouter();
    const { categoryId, categoryName } = useLocalSearchParams();

    const [writers, setWriters] = useState([]);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedWriter, setSelectedWriter] = useState(null);

    // ধাপ ১: ক্যাটাগরি আইডি অনুযায়ী লেখক লোড করা
    useEffect(() => {
        if (!categoryId) {
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, 'writer'),
            where('cateId', 'array-contains', categoryId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const writersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setWriters(writersData);
            setLoading(false);
            if (writersData.length > 0) {
                setSelectedWriter(writersData[0]);
            } else {
                setSelectedWriter(null);
            }
        });

        return () => unsubscribe();
    }, [categoryId]);

    useEffect(() => {
        if (!selectedWriter?.id || !categoryId) {
            setBooks([]);
            return;
        }

        const q = query(
            collection(db, 'shortStory'),
            where('writerId', '==', selectedWriter.id),
            where('cateId', '==', categoryId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const booksData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                type: 'audio'
            }));
            setBooks(booksData);
        });

        return () => unsubscribe();
    }, [selectedWriter, categoryId]);




    const handleBookPress = (item) => {
        router.push({ pathname: '/reader', params: { book: JSON.stringify(item) } });
    };

    // লেখককে রেন্ডার করার জন্য FlatList আইটেম
    const renderWriterItem = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.writerItemContainer,
                selectedWriter?.id === item.id && styles.activeWriterItem
            ]}
            onPress={() => setSelectedWriter(item)}
        >
            <Image source={{ uri: item.img }} style={styles.writerImgSmall} />
            <Text style={styles.writerNameSmall}>{item.bn}</Text>
        </TouchableOpacity>
    );

    // বইকে রেন্ডার করার জন্য FlatList আইটেম
    const renderBookItem = ({ item }) => (
        <TouchableOpacity
            style={styles.bookItem}
            onPress={() => handleBookPress(item)}
        >
            <Image source={{ uri: item.artwork }} style={styles.bookImg} />
            <Text numberOfLines={2} style={styles.bookTitle}>{item.title}</Text>
            <View style={styles.iconContainer}>
                <Ionicons name="book-outline" size={30} color="#00b894" />
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.headerContainer}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back-outline" size={28} color={themes.text} />
                </TouchableOpacity>
            </View>

            <View style={styles.container}>
                {loading ? (
                    <ActivityIndicator size="large" color={themes.text} style={styles.loadingIndicator} />
                ) : (
                    <>
                        <Text style={styles.categoryTitle}>{categoryName} লেখক</Text>
                        <FlatList
                            data={writers}
                            renderItem={renderWriterItem}
                            keyExtractor={(item) => item.id}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.writerListContainer}
                        />
                        {books.length > 0 ? (
                            <FlatList
                                data={books}
                                renderItem={renderBookItem}
                                keyExtractor={(item) => item.id}
                                numColumns={3}
                                columnWrapperStyle={styles.columnWrapper}
                                contentContainerStyle={styles.bookList}
                            />
                        ) : (
                            <View style={styles.comingSoonContainer}>
                                <Text style={styles.comingSoon}>Coming Soon</Text>
                            </View>
                        )}


                    </>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: themes.background,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 10,
    },
    backButton: {
        paddingRight: 10,
    },
    container: {
        flex: 1,
        backgroundColor: themes.background,
        paddingHorizontal: 20,
    },
    writerListContainer: {
        paddingVertical: 10,
        gap: 15, // লেখকদের মাঝে gap
        alignItems: 'center'
    },
    writerItemContainer: {
        flexDirection: 'row',   // ছবি + নাম পাশাপাশি
        alignItems: 'center',
        gap: 8,                 // ছবি আর নামের মাঝে ছোট gap
        backgroundColor: themes.background,
        padding: 6,
        borderRadius: 8
    },
    writerImgSmall: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: '#5a4c62'
    },
    writerNameSmall: {
        fontSize: 15,
        color: themes.text,
        fontWeight: '500'
    },
    container: {
        flex: 1,
        backgroundColor: themes.background,
        paddingHorizontal: 20,
        paddingBottom: 10
    },

    categoryTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: themes.text,
        textAlign: 'center',
        marginBottom: 10,
        paddingTop: 10
    },
    bookList: {
        paddingBottom: 20
    },
    columnWrapper: {
        justifyContent: 'space-between',
        marginBottom: 15
    },
    bookItem: {
        width: '30%',
        marginHorizontal: '1.66%',
        alignItems: 'center',
        position: 'relative'
    },
    bookImg: {
        width: '100%',
        aspectRatio: 3 / 4,
        borderRadius: 8,
        backgroundColor: '#333'
    },
    bookTitle: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 6,
        color: themes.text
    },
    iconContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 8,
    },


    // comingSoonContainer: {
    //     flex: 1,                // লেখকের নিচে বাকি জায়গা দখল করবে
    //     justifyContent: 'center',
    //     alignItems: 'center',
    // },

    comingSoonContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 20, // লেখকের জন্য জায়গা রেখে
    },

    comingSoon: {
        textAlign: 'center',
        color: '#999',
        fontStyle: 'italic',
        fontSize: 16
    },


    loadingIndicator: {
        flex: 1,
        justifyContent: 'center'
    }
});