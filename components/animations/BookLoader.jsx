import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

const GOLD = "#F3C623";
const BOOK_WIDTH = 90;
const PAGE_WIDTH = BOOK_WIDTH / 2;

export default function BookLoader({ visible }) {

  const flip = useRef(new Animated.Value(0)).current;
  const loader = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;

    Animated.loop(
      Animated.parallel([
        Animated.timing(flip, {
          toValue: 1,
          duration: 1200,
          easing: Easing.linear,
          useNativeDriver: true
        }),

        Animated.sequence([
          Animated.timing(loader, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true
          }),
          Animated.timing(loader, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true
          })
        ])
      ])
    ).start();

  }, [visible]);

  const rotate = flip.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "-180deg"]
  });

  if (!visible) return null;

  return (
    <View style={styles.container}>

      {/* Book */}
      <View style={styles.book}>

        <View style={styles.leftPage}/>
        <View style={styles.rightPage}/>

        <Animated.View
          style={[
            styles.flipPage,
            {
              transform: [
                { perspective: 800 },
                { translateX: -PAGE_WIDTH / 2 },
                { rotateY: rotate },
                { translateX: PAGE_WIDTH / 2 }
              ]
            }
          ]}
        />

      </View>

      {/* Loader Bar */}

      <View style={styles.loaderBg}>
        <Animated.View
          style={[
            styles.loaderFill,
            {
              transform: [
                { scaleX: loader }
              ]
            }
          ]}
        />
      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    position: "absolute",
    top:0,
    left:0,
    right:0,
    bottom:0,
    justifyContent:"center",
    alignItems:"center",
    backgroundColor:"#e0d5c1",
    zIndex:20
  },

  book:{
    width:BOOK_WIDTH,
    height:BOOK_WIDTH,
    flexDirection:"row",
    backgroundColor:"#F7E6C4",
    borderRadius:4,
    overflow:"hidden"
  },

  leftPage:{
    flex:1,
    backgroundColor:"#FFF8DC"
  },

  rightPage:{
    flex:1,
    backgroundColor:"#FFF8DC"
  },

  flipPage:{
    position:"absolute",
    left:"50%",
    width:PAGE_WIDTH,
    height:"100%",
    backgroundColor:"#FEFBF3"
  },

  loaderBg:{
    marginTop:20,
    width:120,
    height:3,
    backgroundColor:"rgba(0,0,0,0.1)",
    borderRadius:10,
    overflow:"hidden"
  },

  loaderFill:{
    width:"100%",
    height:"100%",
    backgroundColor:GOLD
  }

});
