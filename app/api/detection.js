import fetch from "node-fetch";

const APIKEY = process.env.CLARIFAI_API_KEY;
const USER_ID = "clarifai";
const APP_ID = "main";
const MODEL_ID = "general-image-detection";
const MODEL_VERSION_ID = "1580bb1932594c93b7e2e04456af7c6f";

export const detectObjects = async (imageUrl, imageBase64) => {
  const raw = JSON.stringify({
    user_app_id: {
      user_id: USER_ID,
      app_id: APP_ID,
    },
    inputs: [
      {
        data: {
          image: imageUrl ? { url: imageUrl } : { base64: imageBase64 },
        },
      },
    ],
  });

  const requestOptions = {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Key ${APIKEY}`,
    },
    body: raw,
  };

  try {
    const response = await fetch(
      `https://api.clarifai.com/v2/models/${MODEL_ID}/versions/${MODEL_VERSION_ID}/outputs`,
      requestOptions
    );
    const result = await response.json();

    if (__DEV__) console.log("Clarifai result:", result);

    if (!result.outputs || !result.outputs[0].data.regions) return [];

    const objects = result.outputs[0].data.regions.map((region) => {
      const boundingBox = region.region_info.bounding_box;
      const centerX = (boundingBox.left_col + boundingBox.right_col) / 2;
      const centerY = (boundingBox.top_row + boundingBox.bottom_row) / 2;

      return {
        name: region.data.concepts[0].name,
        value: region.data.concepts[0].value,
        boundingBox: {
          top: boundingBox.top_row,
          left: boundingBox.left_col,
          bottom: boundingBox.bottom_row,
          right: boundingBox.right_col,
          centerX,
          centerY,
        },
      };
    });

    return objects;
  } catch (error) {
    console.log("Detection error", error);
    return [];
  }
};
