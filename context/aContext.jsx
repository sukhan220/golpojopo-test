// import React, { createContext, useContext, useState } from 'react';
// import { AudioPro, useAudioPro } from 'react-native-audio-pro';

// const AudioContext = createContext();

// export const AudioProvider = ({ children }) => {
//   const { state, playingTrack, position, duration } = useAudioPro();
//   const [clipLoadedTrackId, setClipLoadedTrackId] = useState(null);

//   const [isClipMode, setIsClipMode] = useState(false);

//   const [activeClipId, setActiveClipId] = useState(null);

//   const currentTrack = playingTrack;
//   const isPlaying = state === 'PLAYING';

//   /* ---------------- NORMAL TRACK SYSTEM ---------------- */
//   const playTrack = async (track, options = {}) => {
//     if (!track?.url) return;

//     setIsClipMode(false);
//     setActiveClipId(null);

//     if (currentTrack?.id === track.id) {
//       await AudioPro.seekTo(options.initialPosition || 0);
//       // await AudioPro.resume();
//       return;
//     }

//     await AudioPro.stop();
//     await AudioPro.play(track, {
//       startTimeMs: options.initialPosition || 0,
//       autoPlay: true,
//     });
//   };

//   /* ---------------- CLIP SYSTEM ---------------- */
  
//   /**
//    * preloadClip: অডিও লোড করে বাফার করবে এবং নির্দিষ্ট পজিশনে দাঁড়িয়ে থাকবে।
//    */
//   const preloadClip = async (track, startPosition = 0, clipId) => {
//     if (!track?.url) return;
//     setIsClipMode(true);
//     setActiveClipId(clipId);

//     // যদি একই ট্র্যাক অলরেডি লোড থাকে, শুধু পজিশন আপডেট করো
//     if (clipLoadedTrackId === track.id) {
//       await AudioPro.seekTo(startPosition);
//       return;
//     }

//     await AudioPro.stop();

//     // startTimeMs ব্যবহার করা হয়েছে যাতে প্লেয়ার লোড হওয়ার পর ওই পয়েন্টে দাঁড়িয়ে থাকে
//     await AudioPro.play(track, { 
//       autoPlay: true, 
//       startTimeMs: startPosition 
//     });

//     setClipLoadedTrackId(track.id);
//   };

//   /**
//    * playPreloadedClip: যা লোড হয়ে আছে তা বাজানো শুরু করবে
//    */
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
//         clipLoadedTrackId,
//         playTrack,
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