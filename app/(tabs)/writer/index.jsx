


import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Image,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Appearance,
} from 'react-native';
import { useNavigation } from 'expo-router';
import Header from '@/components/buildApp/header';
import { Colors } from '@/constants/Colors';
import { db } from '@/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';



const colorScheme = Appearance.getColorScheme();
const themes = colorScheme === 'dark' ? Colors.dark : Colors.light;

const WriterListScreen = () => {
    const navigation = useNavigation();
    const [writers, setWriters] = useState([]);



    useEffect(() => {
        const q = query(
            collection(db, 'writer'),
            where('show', '==', true) // শুধু show:true ডকুমেন্ট আনবে
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const fetchedWriters = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setWriters(fetchedWriters);
            },
            (error) => {
                console.error('Error fetching writers:', error);
            }
        );

        return () => unsubscribe();
    }, []);



    useEffect(() => {
        const unsubscribe = onSnapshot(
            collection(db, 'writer'),
            (snapshot) => {
                const fetchedWriters = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setWriters(fetchedWriters);
            },
            (error) => {
                console.error('Error fetching writers:', error);
            }
        );

        return () => unsubscribe();
    }, []);

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.item}
            onPress={() =>
                // navigation.navigate('writerBooks', { writerName: item.name })
                navigation.navigate('writerBooks', { writerName: JSON.stringify(item) })

            }
        >
            <Image
                source={{ uri: item.img }} // Firebase ফিল্ড img থেকে আসবে
                style={styles.image}
            />
            <Text style={styles.name}>{item.bn}</Text>
        </TouchableOpacity>
    );


    return (
        <View style={styles.container}>
            <Header />
            <FlatList
                data={writers}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

export default WriterListScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: themes.backgroundColor,
        paddingHorizontal: 16,
        paddingTop: 40,
    },
    list: {
        paddingBottom: 20,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1f1b24',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 10,
        marginBottom: 12,
    },
    image: {
        width: 64,
        height: 64,
        borderRadius: 32,
        marginRight: 16,
        borderWidth: 1,
        borderColor: '#e0c08d',
    },
    name: {
        fontSize: 16,
        color: '#fff',
        fontFamily: 'NotoSerifBengali-Medium',
    },
});
