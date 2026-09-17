

// import React, { useEffect, useState } from 'react';
// import { StyleSheet, Text, TouchableOpacity, Vibration, View } from 'react-native';

// const SimplePuzzle = () => {
//     const [tiles, setTiles] = useState([]);
//     const [timer, setTimer] = useState(0);
//     const [isActive, setIsActive] = useState(false);
//     const [isSolved, setIsSolved] = useState(false);

//     const initGame = () => {
//         let initialTiles = [1, 2, 3, 4, 5, 6, 7, 8, null];
//         let shuffled = [...initialTiles].sort(() => Math.random() - 0.5);
//         setTiles(shuffled);
//         setTimer(0);
//         setIsActive(true);
//         setIsSolved(false);
//     };

//     const formatTime = (seconds) => {
//         const mins = Math.floor(seconds / 60);
//         const secs = seconds % 60;
//         return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
//     };

//     useEffect(() => {
//         initGame();
//     }, []);

//     useEffect(() => {
//         let interval = null;
//         if (isActive && !isSolved) {
//             interval = setInterval(() => {
//                 setTimer((s) => s + 1);
//             }, 1000);
//         } else {
//             clearInterval(interval);
//         }
//         return () => clearInterval(interval);
//     }, [isActive, isSolved]);

//     const handleTilePress = (index) => {
//         if (isSolved) return;
//         const emptyIndex = tiles.indexOf(null);
//         const row = Math.floor(index / 3);
//         const col = index % 3;
//         const emptyRow = Math.floor(emptyIndex / 3);
//         const emptyCol = emptyIndex % 3;

//         const isAdjacent = Math.abs(row - emptyRow) + Math.abs(col - emptyCol) === 1;

//         if (isAdjacent) {
//             const newTiles = [...tiles];
//             newTiles[emptyIndex] = newTiles[index];
//             newTiles[index] = null;
//             setTiles(newTiles);
//             checkWin(newTiles);
//         } else {
//             Vibration.vibrate(40);
//         }
//     };

//     const checkWin = (currentTiles) => {
//         const winningPattern = [1, 2, 3, 4, 5, 6, 7, 8, null];
//         const solved = currentTiles.every((val, index) => val === winningPattern[index]);
//         if (solved) {
//             setIsSolved(true);
//             setIsActive(false);
//         }
//     };

//     return (
//         <View style={styles.gameContainer}>
//             <View style={styles.statsRow}>
//                 <Text style={styles.timerText}>Time: {formatTime(timer)}</Text>
//                 <Text style={styles.statusText}>
//                     {isSolved ? "Winner! 🎉" : "Slide to solve"}
//                 </Text>
//             </View>

//             <View style={styles.grid}>
//                 {tiles.map((num, index) => (
//                     <TouchableOpacity
//                         key={index}
//                         activeOpacity={0.7}
//                         onPress={() => handleTilePress(index)}
//                         style={[
//                             styles.tile,
//                             num === null ? styles.emptyTile : styles.activeTile
//                         ]}
//                     >
//                         <Text style={styles.tileText}>{num}</Text>
//                     </TouchableOpacity>
//                 ))}
//             </View>

//             <TouchableOpacity onPress={initGame} style={styles.resetBtn}>
//                 <Text style={styles.resetText}>New Game</Text>
//             </TouchableOpacity>

//             {isSolved && (
//                 <Text style={styles.winMsg}>Excellent! Puzzle Solved.</Text>
//             )}
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     gameContainer: {
//         padding: 20,
//         backgroundColor: '#251a27', // Slightly darker/smoother purple
//         borderRadius: 24,
//         alignItems: 'center',
//         width: '100%',
//         borderWidth: 1,
//         borderColor: '#3a2c42',
//     },
//     statsRow: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         width: '100%',
//         marginBottom: 20,
//         paddingHorizontal: 5,
//     },
//     timerText: { 
//         color: '#EAB308', // Muted Gold
//         fontWeight: '700', 
//         fontSize: 15,
//         letterSpacing: 0.5
//     },
//     statusText: { 
//         color: '#a191a8', 
//         fontSize: 13,
//         fontWeight: '500'
//     },
//     grid: {
//         width: 220,
//         height: 220,
//         flexDirection: 'row',
//         flexWrap: 'wrap',
//         justifyContent: 'center',
//         alignContent: 'center',
//         gap: 8,
//     },
//     tile: {
//         width: 65,
//         height: 65,
//         justifyContent: 'center',
//         alignItems: 'center',
//         borderRadius: 12,
//     },
//     activeTile: {
//         backgroundColor: '#3a2c42',
//         borderWidth: 1.5,
//         borderColor: 'rgba(234, 179, 8, 0.3)', // Transparent gold border
//         elevation: 2,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.2,
//         shadowRadius: 3,
//     },
//     emptyTile: {
//         backgroundColor: 'transparent',
//     },
//     tileText: {
//         color: '#f9f0e6',
//         fontSize: 24,
//         fontWeight: '700',
//     },
//     resetBtn: {
//         marginTop: 25,
//         backgroundColor: '#EAB308', // Muted Gold
//         paddingHorizontal: 30,
//         paddingVertical: 12,
//         borderRadius: 30,
//         shadowColor: '#EAB308',
//         shadowOffset: { width: 0, height: 4 },
//         shadowOpacity: 0.3,
//         shadowRadius: 5,
//         elevation: 5,
//     },
//     resetText: { 
//         color: '#1c131e', 
//         fontWeight: '800',
//         fontSize: 14,
//         textTransform: 'uppercase',
//         letterSpacing: 1
//     },
//     winMsg: {
//         color: '#4ade80',
//         marginTop: 15,
//         fontWeight: 'bold',
//         fontSize: 14,
//     },
// });

// export default SimplePuzzle;

import { Ionicons } from '@expo/vector-icons'; // আইকন ব্যবহারের জন্য
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, Vibration, View } from 'react-native';

const SimplePuzzle = () => {
    const [tiles, setTiles] = useState([]);
    const [timer, setTimer] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [isSolved, setIsSolved] = useState(false);

    const initGame = () => {
        let initialTiles = [1, 2, 3, 4, 5, 6, 7, 8, null];
        let shuffled = [...initialTiles].sort(() => Math.random() - 0.5);
        setTiles(shuffled);
        setTimer(0);
        setIsActive(true);
        setIsSolved(false);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        initGame();
    }, []);

    useEffect(() => {
        let interval = null;
        if (isActive && !isSolved) {
            interval = setInterval(() => {
                setTimer((s) => s + 1);
            }, 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isActive, isSolved]);

    const handleTilePress = (index) => {
        if (isSolved) return;
        const emptyIndex = tiles.indexOf(null);
        const row = Math.floor(index / 3);
        const col = index % 3;
        const emptyRow = Math.floor(emptyIndex / 3);
        const emptyCol = emptyIndex % 3;

        const isAdjacent = Math.abs(row - emptyRow) + Math.abs(col - emptyCol) === 1;

        if (isAdjacent) {
            const newTiles = [...tiles];
            newTiles[emptyIndex] = newTiles[index];
            newTiles[index] = null;
            setTiles(newTiles);
            checkWin(newTiles);
        } else {
            Vibration.vibrate(40);
        }
    };

    const checkWin = (currentTiles) => {
        const winningPattern = [1, 2, 3, 4, 5, 6, 7, 8, null];
        const solved = currentTiles.every((val, index) => val === winningPattern[index]);
        if (solved) {
            setIsSolved(true);
            setIsActive(false);
        }
    };

    return (
        <View style={styles.gameContainer}>
            {/* উপরের ছোট কন্ট্রোল বার */}
            <View style={styles.statsRow}>
                <View style={styles.timerGroup}>
                    <Ionicons name="timer-outline" size={16} color="#8a8a66" />
                    <Text style={styles.timerText}>{formatTime(timer)}</Text>
                </View>

                <View style={styles.rightControls}>
                    <Text style={styles.statusText}>
                        {isSolved ? "Winner! 🎉" : "Slide to solve"}
                    </Text>
                    {/* ছোট রিস্টার্ট বাটন */}
                    <TouchableOpacity onPress={initGame} style={styles.miniResetBtn}>
                        <Ionicons name="refresh" size={18} color="#1c131e" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* পাজল গ্রিড */}
            <View style={styles.grid}>
                {tiles.map((num, index) => (
                    <TouchableOpacity
                        key={index}
                        activeOpacity={0.7}
                        onPress={() => handleTilePress(index)}
                        style={[
                            styles.tile,
                            num === null ? styles.emptyTile : styles.activeTile
                        ]}
                    >
                        <Text style={styles.tileText}>{num}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {isSolved && (
                <Text style={styles.winMsg}>Excellent! Puzzle Solved.</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    gameContainer: {
        padding: 15,
        backgroundColor: '#251a27',
        borderRadius: 20,
        alignItems: 'center',
        width: '100%',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 15,
    },
    timerGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: 'rgba(234, 179, 8, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    timerText: { 
        color: '#8a8a66', 
        fontWeight: '700', 
        fontSize: 14,
    },
    rightControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    statusText: { 
        color: '#a191a8', 
        fontSize: 12,
        fontWeight: '500'
    },
    miniResetBtn: {
        backgroundColor: '#8a8a66',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
    },
    grid: {
        width: 210,
        height: 210,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 6,
    },
    tile: {
        width: 62,
        height: 62,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
    },
    activeTile: {
        backgroundColor: '#3a2c42',
        borderWidth: 1,
        borderColor: 'rgba(234, 179, 8, 0.2)',
    },
    emptyTile: {
        backgroundColor: 'transparent',
    },
    tileText: {
        color: '#f9f0e6',
        fontSize: 20,
        fontWeight: '700',
    },
    winMsg: {
        color: '#4ade80',
        marginTop: 10,
        fontWeight: 'bold',
        fontSize: 13,
    },
});

export default SimplePuzzle;