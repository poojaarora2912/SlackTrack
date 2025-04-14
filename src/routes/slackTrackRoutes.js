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

// router.post("/query-summary", async (req, res) => {
//   console.log("Received Request:", req.body);
//   const query = req.body.text;
//   const responseUrl = req.body.response_url;
//   const channelId = "1234";
//   const channelName = "slack_track";

//   console.log("Query:", query);
//   console.log("Channel ID:", channelId);
//   console.log("Channel Name:", channelName);
//   console.log("Response URL:", responseUrl);

//   try {
//     const summary = await fetchSlackDataUsingQuery(query, channelId, channelName);
//     console.log("Query-Based Summary Fetched:", summary);

//     await axios.post(responseUrl, {
//       response_type: "in_channel",
//       text: `📊 Here's the summary for *${query}*:\n\n${summary}`,
//     });

//     res.send({
//       message: "Done processing!",
//       query,
//     });
//   } catch (error) {
//     console.error("Error:", error);
//     await axios.post(responseUrl, {
//       response_type: "ephemeral",
//       text: `❌ Failed to fetch summary for "${query}". Please try again later.`,
//     });
//   }
// });

router.post("/trigger-slack-response", (req, res) => {
  const { responseUrl, message } = req.body;

  console.log("Triggering Slack Response:", responseUrl. message);

  const slackPayload = JSON.stringify({
    response_type: "in_channel",
    text: message,
  });

  console.log("Slack Payload:", slackPayload);

  const url = new URL(responseUrl);

  console.log("Parsed URL:", url);

  const options = {
    hostname: url.hostname,
    path: url.pathname + url.search,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(slackPayload),
    },
  };

  console.log("Slack Request Options:", options);

  const slackReq = https.request(options, (slackRes) => {
    let data = "";
    slackRes.on("data", (chunk) => (data += chunk));
    slackRes.on("end", () => {
      console.log("✅ Message sent to Slack:", data);
      res.status(200).json({ success: true });
    });
  });

  slackReq.on("error", (e) => {
    console.error("❌ Error sending to Slack:", e.message);
    res.status(500).json({ success: false, error: e.message });
  });

  slackReq.write(slackPayload);
  slackReq.end();
});


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

  res.status(200).send({
    response_type: "ephemeral",
    text: `🕐 Processing your query: *${query}*... You'll get the summary shortly.`,
  });

  try {
    const summary = fetchSlackDataUsingQuery(query, channelId, channelName);
    const message = "done processing!";

    console.log("ready to send message");

    await fetch(`http://localhost:4000/trigger-slack-response`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ responseUrl, message }),
    });

    console.log("sent message to slack");
    
  } catch (error) {
    console.error("❌ Failed to trigger Slack response:", error.message);
  }


  // try {
  //   console.log("try block executed!")
  //   const summary = await fetchSlackDataUsingQuery(query, channelId, channelName);

  //   const slackResponse = await axios.post("https://hooks.slack.com/commands/TG56C3C2U/8771946599824/p7pUHY671Dlnxtd3vlwSIPFG", {
  //     response_type: "in_channel",
  //     text: `Here's the summary for *${query}*:\n\n${summary}`,
  //   }, {
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     timeout: 5000,
  //   });
    
  //   console.log("Slack Response Data:", slackResponse.data);    

  //   console.log("✅ Test message posted to Slack via response_url.");
  // } catch (error) {
  //   console.error("❌ Failed to post test message to Slack:", error.message);
  // }

  // try {
  //   const summary = await fetchSlackDataUsingQuery(query, channelId, channelName);
  //   console.log("Query-Based Summary Fetched:", summary);

  //   axios.post(responseUrl, {
  //     response_type: "in_channel", // or "ephemeral"
  //     text: `📊 Here's the summary for *${query}*:\n\n${summary}`,
  //   }, {
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //   });
  // } catch (error) {
  //   console.error("❌ Error while processing summary:", error.message);
  //   await axios.post(responseUrl, {
  //     response_type: "ephemeral",
  //     text: `❌ Failed to fetch summary for *${query}*. Please try again later.`,
  //   }, {
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //   });
  // }
});

// router.post("/query-summary", async (req, res) => {
//   console.log("Received Request:", req.body);
//   const query = req.body.text;
//   const responseUrl = req.body.response_url;

//   console.log("Query:", query);
//   console.log("Response URL:", responseUrl);

//   // Step 1: Respond immediately to Slack
//   res.status(200).send({
//     response_type: "ephemeral",
//     text: `🕐 Got your request: *${query}*. Testing response URL now...`,
//   });

//   // Step 2: Send a dummy message back to Slack
//   try {
//     await axios.post(responseUrl, {
//       response_type: "in_channel", // or "ephemeral"
//       text: `✅ This is a test message sent via response_url!\nQuery received: *${query}*`,
//     }, {
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });

//     console.log("✅ Successfully sent test message to response_url.");
//   } catch (error) {
//     console.error("❌ Error sending test message to response_url:", error.message);
//     if (error.response) {
//       console.error("Slack error response:", error.response.data);
//     }
//   }
// });




module.exports = router;
