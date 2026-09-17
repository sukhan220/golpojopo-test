import { View, Text, StyleSheet,Appearance,FlatList, TouchableOpacity,Image} from 'react-native'
import React from 'react'
import { categories } from "@/constants/BooksCategories"
import BooksImages from "@/constants/BooksImages"
import { Colors } from "@/constants/Colors";
  const colrorScheme = Appearance.getColorScheme();


const themes = colrorScheme === "dark" ? Colors.dark : Colors.light;

const Categories = () => {
    return (
        <FlatList
            data={categories}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
                <TouchableOpacity style={styles.itemContainer} onPress={() => navigation.navigate('Category', { category: item.name })}>
                    <Image source={BooksImages[item.id - 1]} style={styles.image} />
                    <Text style={styles.title}>{item.name}</Text>
                </TouchableOpacity>
            )}
        />
    )
}

export default Categories


const styles = StyleSheet.create({
    itemContainer: {
        backgroundColor: themes.background,
        overflow: 'hidden',
        borderRadius: 10,
        paddingRight: 5,
        marginTop: 8,
        marginRight: 12,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderStyle: "solid",
        borderColor: 'papayawhip',
        borderWidth: 1,
        borderRadius: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    image: {
        width: 30,
        height: 40,
        borderRadiusRigh: 2,
        marginRight: 12,
    },
    item: {
        width: "100%",
        maxWidth: 600,
        height: 100,
        marginBottom: 10,
        overflow: "hidden",
        marginHorizontal: "auto",
    },
})