import { MOCK_API } from "@env";

const NEW_ALBUM_URL = `${process.env.MOCK_API}/new-album`;
const TRACKS_URL = `${process.env.MOCK_API}/tracks`;

export const getNewAlbums = async () => {
  const response = await fetch(NEW_ALBUM_URL);
  const data = await response.json();
  return data;
};

export const getTracks = async () => {
  const response = await fetch(TRACKS_URL);
  const data = await response.json();
  return data;
};

// Add a new track
export const addTrack = async (trackData) => {
  try {
    const response = await fetch(TRACKS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(trackData),
    });

    if (!response.ok) {
      throw new Error("Failed to add track");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error adding track:", error);
    throw error;
  }
};

// Update an existing track
export const updateTrack = async (trackId, updatedTrackData) => {
  try {
    const response = await fetch(`${TRACKS_URL}/${trackId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedTrackData),
    });

    if (!response.ok) {
      throw new Error("Failed to update track");
      console.log("Failed to update track");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating track:", error);
    throw error;
  }
};

// Delete a track
export const deleteTrack = async (trackId) => {
  try {
    const response = await fetch(`${TRACKS_URL}/${trackId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete track");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error deleting track:", error);
    throw error;
  }
};
