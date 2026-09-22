

import { Colors } from '@/constants/Colors';
import { db } from '@/firebase';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useNavigation } from 'expo-router';
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



// export default function WriterBooks() {
//     const route = useRoute();
//     const navigation = useNavigation();
//     const writerData = JSON.parse(route.params.writerName);
//     console.log(writerData.cateId)

//     const [activeCategory, setActiveCategory] = useState(writerData.categories[0]);
//     // console.log(activeCategory)
//     const [combinedList, setCombinedList] = useState([]);
//     const [loading, setLoading] = useState(true);

//     const handleBookPress = (item) => {
//         // অডিও ফাইলের পাথ এবং অন্যান্য ডেটা JSON স্ট্রিং হিসেবে পাঠান
//         navigation.navigate('audioDetails', { book: JSON.stringify(item) });
//     };

//     const handleKindlePress = (item) => {
//         // playTrack(item); // এই ফাংশনটি আপনার কোডে সংজ্ঞায়িত করা নেই, তাই এটি আপাতত মন্তব্য করা হলো।
//         navigation.navigate('reader', { book: JSON.stringify(item) });
//     };

//     // useEffect(() => {
//     //     if (!activeCategory) return;
//     //     setLoading(true);

//     //     const collections = categoryCollectionMap[activeCategory];
//     //     if (!collections) {
//     //         setCombinedList([]);
//     //         setLoading(false);
//     //         return;
//     //     }

//     //     const audioQ = query(
//     //         collection(db, collections.audio),
//     //         where('writerId', '==', writerData.id)
//     //     );
//     //     const ebookQ = query(
//     //         collection(db, collections.ebook),
//     //         where('writerId', '==', writerData.id)
//     //     );

//     //     let audioData = [];
//     //     let ebookData = [];
//     //     let fetchedCount = 0;

//     //     const handleDataFetch = () => {
//     //         fetchedCount++;
//     //         if (fetchedCount === 2) {
//     //             const finalCombinedList = [
//     //                 ...audioData.map(item => ({ ...item, type: 'audio' })),
//     //                 ...ebookData.map(item => ({ ...item, type: 'ebook' }))
//     //             ];
//     //             setCombinedList(finalCombinedList);
//     //             setLoading(false);
//     //         }
//     //     };

//     //     const unsubAudio = onSnapshot(audioQ, (snapshot) => {
//     //         audioData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//     //         handleDataFetch();
//     //     });

//     //     const unsubEbook = onSnapshot(ebookQ, (snapshot) => {
//     //         ebookData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//     //         handleDataFetch();
//     //     });

//     //     return () => {
//     //         unsubAudio();
//     //         unsubEbook();
//     //     };
//     // }, [activeCategory]);

//     useEffect(() => {
//         if (!activeCategory) return;
//         setLoading(true);

//         const audioQ = query(
//             collection(db, 'books'),
//             where('writerId', '==', writerData.id),
//             where('cateId', '==', activeCategory)   // category অনুযায়ী filter
//         );
//         const ebookQ = query(
//             collection(db, 'shortStory'),
//             where('writerId', '==', writerData.id),
//             where('cateId', '==', activeCategory)   // category অনুযায়ী filter
//         );

//         let audioData = [];
//         let ebookData = [];
//         let fetchedCount = 0;

//         const handleDataFetch = () => {
//             fetchedCount++;
//             if (fetchedCount === 2) {
//                 const finalCombinedList = [
//                     ...audioData.map(item => ({ ...item, type: 'audio' })),
//                     ...ebookData.map(item => ({ ...item, type: 'ebook' }))
//                 ];
//                 setCombinedList(finalCombinedList);
//                 setLoading(false);
//             }
//         };

//         const unsubAudio = onSnapshot(audioQ, (snapshot) => {
//             audioData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//             handleDataFetch();
//         });

//         const unsubEbook = onSnapshot(ebookQ, (snapshot) => {
//             ebookData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//             handleDataFetch();
//         });

//         return () => {
//             unsubAudio();
//             unsubEbook();
//         };
//     }, [activeCategory]);


//     const renderCategory = ({ item }) => (
//         <TouchableOpacity
//             style={[
//                 styles.categoryBtn,
//                 activeCategory === item && styles.activeCategory
//             ]}
//             onPress={() => setActiveCategory(item)}
//         >
//             <Text style={styles.categoryText}>{item}</Text>
//         </TouchableOpacity>
//     );

//     const renderBook = ({ item }) => (
//         <TouchableOpacity
//             style={styles.bookItem}
//             onPress={() => {
//                 if (item.type === 'audio') {
//                     handleBookPress(item);
//                 } else if (item.type === 'ebook') {
//                     handleKindlePress(item);
//                 }
//             }}
//         >
//             <Image source={{ uri: item.artwork }} style={styles.bookImg} />
//             <Text numberOfLines={2} style={styles.bookTitle}>{item.title}</Text>
//             <View style={styles.iconContainer}>
//                 {item.type === 'audio' ? (
//                     <Ionicons name="play-circle" size={30} color="#f0c400" />
//                 ) : (
//                     <Ionicons name="book" size={30} color="#f0c400" />
//                 )}
//             </View>
//         </TouchableOpacity>
//     );

//     return (
//         <SafeAreaView style={styles.safeArea}>
//             <View style={styles.headerContainer}>
//                 <TouchableOpacity
//                     style={styles.backButton}
//                     onPress={() => navigation.goBack()}
//                 >
//                     <Ionicons name="arrow-back-outline" size={28} color={themes.text} />
//                 </TouchableOpacity>
//             </View>

//             <View style={styles.container}>
//                 <View style={styles.writerInfo}>
//                     <Image source={{ uri: writerData.img }} style={styles.writerImg} />
//                     <Text style={styles.writerName}>{writerData.bn}</Text>
//                 </View>

//                 <FlatList
//                     data={writerData.categories}
//                     renderItem={renderCategory}
//                     keyExtractor={(item, index) => index.toString()}
//                     horizontal
//                     showsHorizontalScrollIndicator={false}
//                     contentContainerStyle={styles.categoryList}
//                     style={{
//                         backgroundColor: themes.background,
//                         maxHeight: 55,
//                         marginBottom: 10
//                     }}
//                 />

//                 {loading ? (
//                     <ActivityIndicator size="large" color={themes.text} style={styles.loadingIndicator} />
//                 ) : (
//                     <View style={styles.contentContainer}>
//                         {combinedList.length > 0 ? (
//                             <FlatList
//                                 data={combinedList}
//                                 renderItem={renderBook}
//                                 keyExtractor={(item) => item.id + item.type}
//                                 numColumns={3}
//                                 columnWrapperStyle={styles.columnWrapper}
//                                 contentContainerStyle={styles.bookList}
//                             />
//                         ) : (
//                             <Text style={styles.comingSoon}>Coming Soon</Text>
//                         )}
//                     </View>
//                 )}
//             </View>
//         </SafeAreaView>
//     );
// }


export default function WriterBooks() {
    const route = { params: useLocalSearchParams() };
    const navigation = useNavigation();
    const writerData = JSON.parse(route.params.writerName);

    // default active category -> cateId[0]
    const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
    const activeCategoryId = writerData.cateId[activeCategoryIndex]; // query তে যাবে
    const [combinedList, setCombinedList] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleBookPress = (item) => {
        navigation.navigate('audioDetails', { book: JSON.stringify(item) });
    };

    const handleKindlePress = (item) => {
        navigation.navigate('reader', { book: JSON.stringify(item) });
    };

    useEffect(() => {
        if (!activeCategoryId) return;
        setLoading(true);

        const audioQ = query(
            collection(db, 'books'),
            where('writerId', '==', writerData.id),
            where('cateId', '==', activeCategoryId)
        );
        const ebookQ = query(
            collection(db, 'shortStory'),
            where('writerId', '==', writerData.id),
            where('cateId', '==', activeCategoryId)
        );

        let audioData = [];
        let ebookData = [];
        let fetchedCount = 0;

        const handleDataFetch = () => {
            fetchedCount++;
            if (fetchedCount === 2) {
                const finalCombinedList = [
                    ...audioData.map(item => ({ ...item, type: 'audio' })),
                    ...ebookData.map(item => ({ ...item, type: 'ebook' }))
                ];
                setCombinedList(finalCombinedList);
                setLoading(false);
            }
        };

        const unsubAudio = onSnapshot(audioQ, (snapshot) => {
            audioData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            handleDataFetch();
        });

        const unsubEbook = onSnapshot(ebookQ, (snapshot) => {
            ebookData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            handleDataFetch();
        });

        return () => {
            unsubAudio();
            unsubEbook();
        };
    }, [activeCategoryId]);

    // ক্যাটাগরি নাম দেখাবে, কিন্তু select করলে index থেকে cateId বের হবে
    const renderCategory = ({ item, index }) => (
        <TouchableOpacity
            style={[
                styles.categoryBtn,
                activeCategoryIndex === index && styles.activeCategory
            ]}
            onPress={() => setActiveCategoryIndex(index)}
        >
            <Text style={styles.categoryText}>{item}</Text>
        </TouchableOpacity>
    );

    const renderBook = ({ item }) => (
        <TouchableOpacity
            style={styles.bookItem}
            onPress={() => {
                if (item.type === 'audio') {
                    handleBookPress(item);
                } else {
                    handleKindlePress(item);
                }
            }}
        >
            <Image source={{ uri: item.artwork }} style={styles.bookImg} />
            <Text numberOfLines={2} style={styles.bookTitle}>{item.title}</Text>
            <View style={styles.iconContainer}>
                {item.type === 'audio' ? (
                    <Ionicons name="play-circle" size={30} color="#f0c400" />
                ) : (
                    <Ionicons name="book" size={30} color="#f0c400" />
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.headerContainer}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back-outline" size={28} color={themes.text} />
                </TouchableOpacity>
            </View>

            <View style={styles.container}>
                <View style={styles.writerInfo}>
                    <Image source={{ uri: writerData.img }} style={styles.writerImg} />
                    <Text style={styles.writerName}>{writerData.bn}</Text>
                </View>

                <FlatList
                    data={writerData.categories}
                    renderItem={renderCategory}
                    keyExtractor={(item, index) => index.toString()}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryList}
                    style={{
                        backgroundColor: themes.background,
                        maxHeight: 55,
                        marginBottom: 10
                    }}
                />

                {loading ? (
                    <ActivityIndicator size="large" color={themes.text} style={styles.loadingIndicator} />
                ) : (
                    <View style={styles.contentContainer}>
                        {combinedList.length > 0 ? (
                            <FlatList
                                data={combinedList}
                                renderItem={renderBook}
                                keyExtractor={(item) => item.id + item.type}
                                numColumns={3}
                                columnWrapperStyle={styles.columnWrapper}
                                contentContainerStyle={styles.bookList}
                            />
                        ) : (
                            <Text style={styles.comingSoon}>Coming Soon</Text>
                        )}
                    </View>
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
    writerInfo: {
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderColor: '#333'
    },
    writerImg: {
        width: 90,
        height: 90,
        borderRadius: 45,
        borderWidth: 2,
        borderColor: '#e0c08d'
    },
    writerName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: themes.text,
        marginTop: 8
    },
    categoryList: {
        paddingVertical: 8,
        paddingHorizontal: 0,
        gap: 12,
        alignItems: 'center'
    },
    categoryBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 25,
        backgroundColor: '#3a2c42',
        borderWidth: 1,
        borderColor: '#5a4c62'
    },
    activeCategory: {
        backgroundColor: '#f0c400',
        borderColor: '#f0c400'
    },
    categoryText: {
        fontSize: 16,
        color: '#f9eccc',
        fontWeight: '500'
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 0
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
    comingSoon: {
        textAlign: 'center',
        color: '#999',
        fontStyle: 'italic',
        marginVertical: 14
    },
    loadingIndicator: {
        marginTop: 20
    }
});