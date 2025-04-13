const express = require("express");
const { fetchSlackData, fetchSlackDataUsingQuery } = require("../slackService");

const router = express.Router();


router.post("/slacktrack", (req, res) => {

  const { query } = req.body;

  res.send("Hello from SlackTrack!", query);
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

router.post("/query-summary", async (req, res) => {
  const { query, channelId, channelName } = req.body;
  console.log("Query:", query);
  try {
    const summary = await fetchSlackDataUsingQuery(query, channelId, channelName);
    console.log("Query-Based Summary Fetched:", summary);

    res.status(200).json({ summary });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});


module.exports = router;
