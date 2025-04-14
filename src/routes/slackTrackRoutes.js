const express = require("express");
const https = require("https");
const fetch = require("node-fetch");
const axios = require("axios");

const { fetchSlackData, fetchSlackDataUsingQuery, sendDataToChannel } = require("../slackService");

const router = express.Router();


router.post("/slacktrack", (req, res) => {
  console.log("Received Request:", req.body);
  const query = req.body.text;
  console.log("Received Query:", query);
  res.send({
    message: "Hello from SlackTrack!",
    query,
  });
});

router.post("/summary-range", async (req, res) => {

  let [query, startDate, endDate] = req.body.text.split(" ");

  console.log("Received Request:", req.body);
  console.log("Query:", query);
  console.log("Start Date:", startDate);
  console.log("End Date:", endDate);

  if (startDate) startDate = Math.floor(new Date(startDate).getTime() / 1000);
  if (endDate) endDate = Math.floor(new Date(endDate).getTime() / 1000);

  const channelId = "C08J6TG41NC";

  res.status(200).send({
    response_type: "ephemeral",
    text: `🕐 Processing your query: *${query}*... You'll get the summary shortly.`,
  });

  try {
    const slackData = await fetchSlackData(query, channelId, startDate, endDate);
    console.log("Slack Data Fetched:", slackData);

    await sendDataToChannel(channelId, slackData);

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});


router.post("/query-summary", async (req, res) => {
  console.log("Received Request:", req.body);
  const query = req.body.text;

  const channelId = "C08J6TG41NC";
  const channelName = "slack_track";

  console.log("Query:", query);
  console.log("Channel ID:", channelId);
  console.log("Channel Name:", channelName);

  res.status(200).send({
    response_type: "ephemeral",
    text: `🕐 Processing your query: *${query}*... You'll get the summary shortly.`,
  });

  try {
    const summary = await fetchSlackDataUsingQuery(query, channelId, channelName);
    const message = "done processing!";

    console.log("ready to send message");

    await sendDataToChannel(channelId, summary);

    console.log("Triggering Slack Response with message:", message);
    
  } catch (error) {
    console.error("❌ Failed to trigger Slack response:", error.message);
  }
});

module.exports = router;
