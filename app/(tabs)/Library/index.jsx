

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    Appearance
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from "@/constants/Colors";
import Header from "@/components/buildApp/header";
import { db } from '@/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export default function AudioTab() {
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState('audio');
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const colorScheme = Appearance.getColorScheme();
    const themes = colorScheme === "dark" ? Colors.dark : Colors.light;
    const styles = createStyles(themes);



    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "categories"), (snapshot) => {
            const data = [];
            snapshot.forEach((doc) => {
                // doc.id ব্যবহার করে ডকুমেন্টের আইডি ডেটার সাথে যুক্ত করুন
                data.push({ id: doc.id, ...doc.data() });
            });
            setCategories(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const filteredData = categories.filter(item => item[activeTab]);

    const renderCategoryItem = ({ item }) => (
        <TouchableOpacity
            style={styles.gridItem}
            onPress={() => {
                if (activeTab === 'audio') {
                    navigation.navigate('audio', {
                        categoryName: item.bn,
                        categoryId: item.id
                    });
                } else if (activeTab === 'kindle') {
                    navigation.navigate('book', {
                        categoryType: 'kindleBooks',
                        categoryName: item.bn,
                        categoryId: item.id
                    });
                }
            }}
        >
            <Text style={styles.gridText}>{item.bn || item.en}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Header />

            <View style={styles.tabHeader}>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'audio' && styles.activeTab]}
                    onPress={() => setActiveTab('audio')}
                >
                    <Text style={styles.tabText}>Audio</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'kindle' && styles.activeTab]}
                    // শুধুমাত্র onPress ব্যবহার করুন
                    onPress={() => setActiveTab('kindle')}
                >
                    <Text style={styles.tabText}>Kindle</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#f0c400" style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    key={activeTab}
                    data={filteredData}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={renderCategoryItem}
                    numColumns={2}
                    contentContainerStyle={styles.gridContainer}
                />
            )}
        </View>
    );
}

function createStyles(themes) {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: themes.backgroundColor,
            paddingHorizontal: 20,
            paddingTop: 40,
        },
        tabHeader: {
            flexDirection: 'row',
            justifyContent: 'center',
            backgroundColor: '#3a2c42',
            borderRadius: 8,
            overflow: 'hidden',
            marginBottom: 16,
        },
        tabButton: {
            flex: 1,
            paddingVertical: 12,
            alignItems: 'center',
        },
        activeTab: {
            borderBottomWidth: 2,
            borderBottomColor: '#f0c400',
        },
        tabText: {
            fontSize: 16,
            fontWeight: '600',
            color: '#f9eccc',
        },
        gridContainer: {
            paddingBottom: 20,
        },
        gridItem: {
            flex: 1,
            margin: 6,
            height: 60,
            backgroundColor: 'transparent',
            borderRadius: 8,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: 'papayawhip'
        },
        gridText: {
            fontSize: 14,
            fontWeight: '500',
            color: '#FFFFFF',
            textAlign: 'center',
        },
    });
}