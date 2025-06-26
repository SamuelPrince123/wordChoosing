const functions = require("firebase-functions");
const vision = require("@google-cloud/vision");
const cors = require("cors")({ origin: true });

const client = new vision.ImageAnnotatorClient();

exports.ocr = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }
    try {
      const base64 = req.body.image;
      if (!base64) {
        return res.status(400).json({ error: "Missing image base64 data" });
      }
      const [result] = await client.textDetection({
        image: { content: base64 },
      });
      const text = result.textAnnotations[0]?.description || "";
      res.json({ text });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });
});
