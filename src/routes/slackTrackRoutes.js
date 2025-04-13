const express = require("express");
const axios = require("axios");

const { fetchSlackData, fetchSlackDataUsingQuery } = require("../slackService");

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

router.post("/summary", async (req, res) => {
  const { query, channelId, startDate, endDate } = req.body;

  try {
    const slackData = await fetchSlackData(query, channelId, startDate, endDate);
    console.log("Slack Data Fetched:", slackData);

    const summary = "success";

    console.log("Sending Response:", JSON.stringify({ slackData, summary })); 

    res.status(200).json({ slackData, summary }); 
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// router.post("/query-summary", async (req, res) => {
//   const query = req.body.text;
//   console.log("Query:", query);
//   const channelId = "";
//   const channelName = "slack_track";
//   console.log("Channel ID:", channelId);
//   console.log("Channel Name:", channelName);

//   try {
//     const summary = await fetchSlackDataUsingQuery(query, channelId, channelName);
//     console.log("Query-Based Summary Fetched:", summary);

//     res.status(200).json({ summary });
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ error: "Something went wrong" });
//   }
// });

router.post("/query-summary", async (req, res) => {
  console.log("Received Request:", req.body);
  const query = req.body.text;
  const responseUrl = req.body.response_url;
  const channelId = "1234";
  const channelName = "slack_track";

  console.log("Query:", query);
  console.log("Channel ID:", channelId);
  console.log("Channel Name:", channelName);
  console.log("Response URL:", responseUrl);

  // Step 1: Respond to Slack immediately
  // res.status(200).send({
  //   text: `🕐 Processing your query: "${query}"... You'll get the summary shortly.`,
  // });

  try {
    // Step 2: Process the query in the background
    const summary = await fetchSlackDataUsingQuery(query, channelId, channelName);
    console.log("Query-Based Summary Fetched:", summary);

    // Step 3: Send the summary back to Slack using the response_url
    // await axios.post(responseUrl, {
    //   response_type: "in_channel", // or "ephemeral" if only user should see
    //   text: `📊 Here's the summary for *${query}*:\n\n${summary}`,
    // });

    res.send({
      message: "Done processing!",
      query,
    });
  } catch (error) {
    console.error("Error:", error);

    // Optional: notify the user about the failure
    await axios.post(responseUrl, {
      response_type: "ephemeral",
      text: `❌ Failed to fetch summary for "${query}". Please try again later.`,
    });
  }
});


module.exports = router;
