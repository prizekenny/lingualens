import React, { createContext, useContext, useState, useEffect } from "react";
import {
  addTrack as apiAddTrack,
  updateTrack as apiUpdateTrack,
  deleteTrack as apiDeleteTrack,
} from "../api/music";

const TracksContext = createContext();

export const useTracks = () => {
  const context = useContext(TracksContext);
  if (!context) {
    throw new Error("useTracks must be used within a TracksProvider");
  }
  return context;
};

export const TracksProvider = ({ children }) => {
  const [tracks, setTracks] = useState([]); // List of all tracks
  const [playingTrack, setPlayingTrack] = useState(null); // Currently playing track
  const [currentTime, setCurrentTime] = useState(0); // Playback progress in seconds
  const [isPlaying, setIsPlaying] = useState(false); // Play/Pause state
  const [playMode, setPlayMode] = useState("sequential"); // Play mode: "sequential", "shuffle", "repeat"

  // Handle playback progress globally
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (playingTrack && prev >= playingTrack.duration / 1000) {
            // Handle end of track
            playNextTrack();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playingTrack]);

  const togglePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  const playNextTrack = () => {
    const currentIndex = tracks.findIndex(
      (track) => track.id === playingTrack?.id
    );
    let nextTrack;

    if (playMode === "repeat") {
      setCurrentTime(0);
      setIsPlaying(true);
      return;
    } else if (playMode === "shuffle") {
      const randomIndex = Math.floor(Math.random() * tracks.length);
      nextTrack = tracks[randomIndex];
    } else {
      nextTrack = tracks[(currentIndex + 1) % tracks.length];
    }

    setPlayingTrack(nextTrack);
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const playPreviousTrack = () => {
    const currentIndex = tracks.findIndex(
      (track) => track.id === playingTrack?.id
    );
    let prevTrack;

    if (playMode === "shuffle") {
      const randomIndex = Math.floor(Math.random() * tracks.length);
      prevTrack = tracks[randomIndex];
    } else {
      prevTrack = tracks[(currentIndex - 1 + tracks.length) % tracks.length];
    }

    setPlayingTrack(prevTrack);
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const togglePlayMode = () => {
    setPlayMode((prevMode) => {
      if (prevMode === "sequential") return "shuffle";
      if (prevMode === "shuffle") return "repeat";
      return "sequential";
    });
  };

  // Add a new track
  const addTrack = async (newTrack) => {
    // Check for duplicates
    const isDuplicate = tracks.some(
      (track) =>
        track.name.toLowerCase() === newTrack.name.toLowerCase() &&
        track.artist.toLowerCase() === newTrack.artist.toLowerCase()
    );

    if (isDuplicate) {
      alert("Track already exists.");
      console.log("Track already exists, skipping addition.");
      return;
    }

    try {
      const addedTrack = await apiAddTrack(newTrack);

      setTracks((prevTracks) => [...prevTracks, addedTrack]);
      if (
        playingTrack &&
        playingTrack.name === newTrack.name &&
        playingTrack.artist === newTrack.artist
      ) {
        setPlayingTrack((prev) => ({ ...prev, id: addedTrack.id }));
      }
    } catch (error) {
      console.error("Error adding track:", error);
    }
  };
  // Update a track by ID (e.g., toggle favorite)
  const updateTrack = async (id, updatedData) => {
    setTracks((prevTracks) =>
      prevTracks.map((track) =>
        track.id === id ? { ...track, ...updatedData } : track
      )
    );
    if (playingTrack?.id === id) {
      setPlayingTrack((prev) => ({ ...prev, ...updatedData }));
    }

    // Call API to persist changes
    try {
      await apiUpdateTrack(id, updatedData);
    } catch (error) {
      console.error("Error updating track on server:", error);
    }
  };

  // Delete a track by ID
  const deleteTrack = async (id) => {
    setTracks((prevTracks) => prevTracks.filter((track) => track.id !== id));

    // if (playingTrack?.id === id) {
    //   setPlayingTrack(null);
    //   setCurrentTime(0);
    //   setIsPlaying(false);
    // }

    try {
      await apiDeleteTrack(id);
    } catch (error) {
      console.error("Error deleting track on server:", error);
    }
  };

  // Determine if the track is in the collection
  const isTrackInCollection = (track) => {
    return tracks.some(
      (item) =>
        item.name.toLowerCase() === track.name.toLowerCase() &&
        item.artist.toLowerCase() === track.artist.toLowerCase()
    );
  };
  // Toggle track's inclusion in the collection
  const toggleTrackInCollection = (track) => {
    if (isTrackInCollection(track)) {
      deleteTrack(track.id);
    } else {
      addTrack(track);
    }
  };

  return (
    <TracksContext.Provider
      value={{
        tracks,
        setTracks,
        addTrack,
        updateTrack,
        deleteTrack,
        playingTrack,
        setPlayingTrack,
        currentTime,
        setCurrentTime,
        isPlaying,
        togglePlayPause,
        playNextTrack,
        playPreviousTrack,
        playMode,
        togglePlayMode,
        toggleTrackInCollection,
        isTrackInCollection,
      }}
    >
      {children}
    </TracksContext.Provider>
  );
};
