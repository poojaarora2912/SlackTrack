// const axios = require("axios");

// const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// const getGeminiSummary = async (text) => {
//   try {
//     const response = await axios.post(
//       `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateText?key=${GEMINI_API_KEY}`,
//       { prompt: text }
//     );

//     return response.data.candidates[0]?.output || "No summary generated";
//   } catch (error) {
//     throw new Error("Gemini API error");
//   }
// };

// module.exports = { getGeminiSummary };
