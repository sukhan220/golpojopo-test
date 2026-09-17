

// //AudioContext.jsx
// import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
// import { AudioPro, AudioProEventType, useAudioPro } from 'react-native-audio-pro';

// const AudioContext = createContext();

// export const AudioProvider = ({ children }) => {
//   const { state, playingTrack, position, duration, playbackSpeed, volume } = useAudioPro();

//   // Playlist Queue States
//   const [playlistQueue, setPlaylistQueue] = useState([]);
//   const [currentIndex, setCurrentIndex] = useState(-1);

//   const [clipLoadedTrackId, setClipLoadedTrackId] = useState(null);
//   const [isClipMode, setIsClipMode] = useState(false);
//   const [activeClipId, setActiveClipId] = useState(null);

//   const currentTrack = playingTrack;
//   const isPlaying = state === 'PLAYING';

//   /* ---------------- QUEUE HELPERS ---------------- */

//   const playNext = useCallback(async () => {
//     if (currentIndex < playlistQueue.length - 1) {
//       const nextIdx = currentIndex + 1;
//       setCurrentIndex(nextIdx);
//       const nextTrack = playlistQueue[nextIdx];
//       await AudioPro.play(nextTrack, { autoPlay: true });
//     }
//   }, [currentIndex, playlistQueue]);

//   const playPrev = useCallback(async () => {
//     if (currentIndex > 0) {
//       const prevIdx = currentIndex - 1;
//       setCurrentIndex(prevIdx);
//       const prevTrack = playlistQueue[prevIdx];
//       await AudioPro.play(prevTrack, { autoPlay: true });
//     }
//   }, [currentIndex, playlistQueue]);

//   /* ---------------- EVENT LISTENERS (Next/Prev/End) ---------------- */

//   useEffect(() => {
//     // লক স্ক্রিন ও অটো-নেক্সট এর জন্য লিসেনার
//     const subscription = AudioPro.addEventListener((event) => {
//       switch (event.type) {
//         case AudioProEventType.TRACK_ENDED:
//           console.log('Track finished, playing next...');
//           playNext();
//           break;
//         case AudioProEventType.REMOTE_NEXT:
//           console.log('Remote Next pressed');
//           playNext();
//           break;
//         case AudioProEventType.REMOTE_PREV:
//           console.log('Remote Prev pressed');
//           playPrev();
//           break;
//       }
//     });

//     // লক স্ক্রিন কন্ট্রোল কনফিগারেশন
//     AudioPro.configure({
//       showNextPrevControls: true, 
//       showSkipControls: true,
//       skipIntervalMs: 15000,
//     });

//     return () => subscription.remove();
//   }, [playNext, playPrev]);

//   /* ---------------- PLAYLIST SYSTEM ---------------- */

//   const playPlaylist = async (tracks, startIndex = 0) => {
//     setIsClipMode(false);
//     setActiveClipId(null);
//     setPlaylistQueue(tracks);
//     setCurrentIndex(startIndex);

//     await AudioPro.stop();
//     await AudioPro.play(tracks[startIndex], {
//       autoPlay: true,
//       startTimeMs: 0,
//     });
//   };

//   /* ---------------- NORMAL TRACK SYSTEM ---------------- */

//   const playTrack = async (track, options = {}) => {
//     if (!track?.url) return;

//     setIsClipMode(false);
//     setActiveClipId(null);

//     // সিঙ্গেল ট্র্যাক প্লে করলে কিউ ক্লিয়ার করে দিচ্ছি
//     setPlaylistQueue([track]);
//     setCurrentIndex(0);

//     if (currentTrack?.id === track.id) {
//       await AudioPro.seekTo(options.initialPosition || 0);
//       return;
//     }

//     await AudioPro.stop();
//     await AudioPro.play(track, {
//       startTimeMs: options.initialPosition || 0,
//       autoPlay: true,
//     });
//   };

//   /* ---------------- CLIP SYSTEM ---------------- */

//   const preloadClip = async (track, startPosition = 0, clipId) => {
//     if (!track?.url) return;
//     setIsClipMode(true);
//     setActiveClipId(clipId);

//     if (clipLoadedTrackId === track.id) {
//       await AudioPro.seekTo(startPosition);
//       return;
//     }

//     await AudioPro.stop();
//     await AudioPro.play(track, { 
//       autoPlay: true, 
//       startTimeMs: startPosition 
//     });

//     setClipLoadedTrackId(track.id);
//   };

//   const playPreloadedClip = async (trackId) => {
//     if (clipLoadedTrackId === trackId) {
//       await AudioPro.resume();
//     }
//   };

//   /* ---------------- CONTROLS ---------------- */

//   const togglePlayPause = async () => {
//     if (!currentTrack) return;
//     if (isPlaying) await AudioPro.pause();
//     else await AudioPro.resume();
//   };

//   return (
//     <AudioContext.Provider
//       value={{
//         currentTrack,
//         isPlaying,
//         position,
//         duration,
//         state, 
//         playbackSpeed,
//         volume,
//         clipLoadedTrackId,
//         playTrack,
//         playPlaylist, // নতুন এক্সপোর্ট
//         playNext,     // নতুন এক্সপোর্ট
//         playPrev,     // নতুন এক্সপোর্ট
//         togglePlayPause,
//         seekTo: (v) => AudioPro.seekTo(v),
//         setVolume: (v) => AudioPro.setVolume(v),
//         setPlaybackSpeed: (s) => AudioPro.setPlaybackSpeed(s),
//         preloadClip,
//         playPreloadedClip,
//         isClipMode, 
//         setIsClipMode,
//         activeClipId,
//         setActiveClipId
//       }}
//     >
//       {children}
//     </AudioContext.Provider>
//   );
// };

// export const useAudioContext = () => useContext(AudioContext);

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AudioPro, AudioProEventType, useAudioPro } from 'react-native-audio-pro';

const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const { state, playingTrack, position, duration, playbackSpeed, volume } = useAudioPro();

  // Playlist Queue States
  const [playlistQueue, setPlaylistQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const [clipLoadedTrackId, setClipLoadedTrackId] = useState(null);
  const [isClipMode, setIsClipMode] = useState(false);
  const [activeClipId, setActiveClipId] = useState(null);

  // 🔽 নতুন স্টেট: মিনি প্লেয়ার দেখাবে কি না তা কন্ট্রোল করার জন্য
  const [isMiniPlayerVisible, setMiniPlayerVisible] = useState(true);

  const currentTrack = playingTrack;
  const isPlaying = state === 'PLAYING';

  /* ---------------- QUEUE HELPERS ---------------- */

  const playNext = useCallback(async () => {
    if (currentIndex < playlistQueue.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      const nextTrack = playlistQueue[nextIdx];
      await AudioPro.play(nextTrack, { autoPlay: true });
    }
  }, [currentIndex, playlistQueue]);

  const playPrev = useCallback(async () => {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      const prevTrack = playlistQueue[prevIdx];
      await AudioPro.play(prevTrack, { autoPlay: true });
    }
  }, [currentIndex, playlistQueue]);

  /* ---------------- EVENT LISTENERS (Next/Prev/End) ---------------- */

  useEffect(() => {
    const subscription = AudioPro.addEventListener((event) => {
      switch (event.type) {
        case AudioProEventType.TRACK_ENDED:
          console.log('Track finished, playing next...');
          playNext();
          break;
        case AudioProEventType.REMOTE_NEXT:
          console.log('Remote Next pressed');
          playNext();
          break;
        case AudioProEventType.REMOTE_PREV:
          console.log('Remote Prev pressed');
          playPrev();
          break;
      }
    });

    AudioPro.configure({
      showNextPrevControls: true,
      showSkipControls: true,
      skipIntervalMs: 15000,
    });

    return () => subscription.remove();
  }, [playNext, playPrev]);

  /* ---------------- PLAYLIST SYSTEM ---------------- */

  // const playPlaylist = async (tracks, startIndex = 0) => {
  //   setIsClipMode(false);
  //   setActiveClipId(null);
  //   setPlaylistQueue(tracks);
  //   setCurrentIndex(startIndex);

  //   await AudioPro.stop();
  //   await AudioPro.play(tracks[startIndex], {
  //     autoPlay: true,
  //     startTimeMs: 0,
  //   });
  // };
  // ১. এখানে initialTimeMs প্যারামিটার যোগ করুন (ডিফল্ট ০ থাকবে)
  const playPlaylist = async (tracks, startIndex = 0, initialTimeMs = 0) => {
    setIsClipMode(false);
    setActiveClipId(null);
    setPlaylistQueue(tracks);
    setCurrentIndex(startIndex);

    await AudioPro.stop();

    // ২. এবার startTimeMs এ সরাসরি প্যারামিটারটি বসিয়ে দিন
    await AudioPro.play(tracks[startIndex], {
      autoPlay: true,
      startTimeMs: initialTimeMs, // এখন এটি ০ না হয়ে আপনার পাঠানো সময় অনুযায়ী হবে
    });
  };

  /* ---------------- NORMAL TRACK SYSTEM ---------------- */

  const playTrack = async (track, options = {}) => {
    if (!track?.url) return;

    setIsClipMode(false);
    setActiveClipId(null);

    setPlaylistQueue([track]);
    setCurrentIndex(0);

    if (currentTrack?.id === track.id) {
      await AudioPro.seekTo(options.initialPosition || 0);
      return;
    }

    await AudioPro.stop();
    await AudioPro.play(track, {
      startTimeMs: options.initialPosition || 0,
      autoPlay: true,
    });
  };

  /* ---------------- CLIP SYSTEM ---------------- */

  // const preloadClip = async (track, startPosition = 0, clipId) => {
  //   if (!track?.url) return;
  //   setIsClipMode(true);
  //   setActiveClipId(clipId);

  //   if (clipLoadedTrackId === track.id) {
  //     await AudioPro.seekTo(startPosition);
  //     return;
  //   }

  //   await AudioPro.stop();
  //   await AudioPro.play(track, {
  //     autoPlay: true,
  //     startTimeMs: startPosition
  //   });

  //   setClipLoadedTrackId(track.id);
  // };

  // ৪ নম্বর প্যারামিটার হিসেবে 'identifier' যোগ করুন
const preloadClip = async (track, startPosition = 0, clipId, identifier) => {
  if (!track?.url) return;
  
  setIsClipMode(true);
  setActiveClipId(clipId);

  // ১. মেইন আইডির বদলে ইউনিক আইডেন্টিফায়ার (যেমন: track-002-1) চেক করুন
  if (clipLoadedTrackId === identifier) {
    // যদি একই ফাইল হয়, শুধু সময়টা বদলে দাও
    await AudioPro.seekTo(startPosition);
    return;
  }

  // ২. যদি ফাইল ভিন্ন হয় (নতুন পার্ট), তবে স্টপ করে নতুন ইউআরএল প্লে করো
  await AudioPro.stop();
  
  await AudioPro.play(track, {
    autoPlay: true,
    startTimeMs: startPosition
  });

  // ৩. এখন লোডেড আইডি হিসেবে ওই ইউনিক আইডেন্টিফায়ারটি সেভ করে রাখুন
  setClipLoadedTrackId(identifier); 
};

  const playPreloadedClip = async (trackId) => {
    if (clipLoadedTrackId === trackId) {
      await AudioPro.resume();
    }
  };

  /* ---------------- CONTROLS ---------------- */

  const togglePlayPause = async () => {
    if (!currentTrack) return;
    if (isPlaying) await AudioPro.pause();
    else await AudioPro.resume();
  };

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        position,
        duration,
        state,
        playbackSpeed,
        volume,
        clipLoadedTrackId,
        playTrack,
        playPlaylist,
        playNext,
        playPrev,
        togglePlayPause,
        seekTo: (v) => AudioPro.seekTo(v),
        setVolume: (v) => AudioPro.setVolume(v),
        setPlaybackSpeed: (s) => AudioPro.setPlaybackSpeed(s),
        preloadClip,
        playPreloadedClip,
        isClipMode,
        setIsClipMode,
        activeClipId,
        setActiveClipId,
        // 🔽 এগুলো নতুন এক্সপোর্ট করা হলো
        isMiniPlayerVisible,
        setMiniPlayerVisible,

        playlistQueue, 
        currentIndex,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudioContext = () => useContext(AudioContext);