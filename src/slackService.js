const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { fetch } = require("undici");

const SLACK_TOKEN = "xoxp-549216114096-4707499007410-8599683386724-78654ecbc4d4931e58d99f983c8ea8a5";
const GEMINI_API_KEY = "AIzaSyBrNmMAoEU_LdfCbdyHoaR1XdF7cI0By4s";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  systemInstruction: `You are an AI assistant that summarizes Slack messages. Categorize them into:
  - Feature
  - Timeline
  - Build Type
  - Contributors
  - Number of Iterations
  - Number of Defects
  - Additional Notes.
  Use formal and concise language.`,
});

const summarizeMessages = async (messages) => {
  if (!messages.length) return "No messages found to summarize.";

  const chatSession = model.startChat({
    generationConfig: {
      temperature: 1,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
      responseMimeType: "text/plain",
    },
  });

  const promptText = `Summarize the following Slack messages, categorizing them into:
  - Feature
  - Timeline
  - Build Type
  - Contributors
  - Number of Iterations
  - Number of Defects
  - Additional Notes.
  
  I want the response to be formal and concise in HTML format.
  Messages:\n\n${messages.join("\n")}`;

  try {
    const result = await chatSession.sendMessage(promptText);
    return result.response.text();
  } catch (error) {
    console.error("Error generating summary:", error.message);
    return "Failed to generate summary.";
  }
};

const fetchSlackData = async (query, channelId, startDate, endDate) => {

  const params = {
    channel: channelId,
    ...(startDate && { oldest: startDate }),
    ...(endDate && {latest: endDate}),
  };

  try {
    const response = await axios.get("https://slack.com/api/conversations.history", {
      headers: { Authorization: `Bearer ${SLACK_TOKEN}` },
      params: params
    });

    if (response.status !== 200 || !response.data.ok) {
      throw new Error(`Slack API error: ${response.data.error || response.statusText}`);
    }

    const messages = response.data.messages?.map((msg) => msg.text) || [];

    // messages.matches.channel.id

    return await summarizeMessages(messages);
  } catch (error) {
    console.error("Slack API error:", error.message);
    return "Failed to retrieve Slack data.";
  }
};

const fetchSlackDataUsingQuery = async (query, channelId, channelName) => {
  let allMessages = [];
  let page = 1;
  let totalPages = 1;

  if(channelName){
    query = `${query} in:${channelName}`;
  }

  try {
    do {
      const response = await axios.get("https://slack.com/api/search.messages", {
        headers: { Authorization: `Bearer ${SLACK_TOKEN}` },
        params: {
          query,
          page,
          count: 10, // Max limit per request to be changed
        },
      });

      if (!response.data.ok) {
        throw new Error(`Slack API error: ${response.data.error}`);
      }

      const matches = response.data.messages.matches || [];

      let messages = matches;

      // if channel name is not given, get all messages from the channel and filter based on channelId
      if(!channelName){
        messages = matches.filter((match) => match.channel.id === channelId);
      }

      // const messages = matches.filter((match) => match.channel.id === channelId);
      const allMessagesForChannel = messages.map((match) => match.text);

      allMessages = [...allMessages, ...allMessagesForChannel];

      totalPages = response.data.messages.paging.pages;

      page++;
    } while (page <= 2);
  } catch (error) {
    console.error("Error fetching messages:", error.message);
  }

  const sumary = summarizeMessages(allMessages);

  return sumary;
};

const fetchSlackUser = async (userId) => {
  try {
    const response = await axios.get("https://slack.com/api/users.profile.get", {
      headers: { Authorization: `Bearer ${SLACK_TOKEN}` },
      params: { user: userId },
    });

    if (!response.data.ok) {
      throw new Error(`Slack API error: ${response.data.error}`);
    }

    return response.data.user;
  } catch (error) {
    console.error("Error fetching user:", error.message);
    return null;
  }
}

module.exports = { fetchSlackData, fetchSlackDataUsingQuery };