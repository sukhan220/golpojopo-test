// components/Header.jsx
import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function Header() {
    return (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: '#f9f0e6', fontSize: 28, fontWeight: 'bold' }}>
                গল্প <Text style={{ color: '#ffd700' }}>জল্প</Text>
            </Text>
            <Feather name="search" size={24} color="#fff" />
        </View>
    );
}
