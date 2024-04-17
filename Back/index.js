const express = require("express");
const ytdl = require("ytdl-core");
const cors = require("cors");

const app = express();
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS || "*", 
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: "Internal Server Error" });
  next();
});

app.get("/download", async (req, res) => {
  try {
    const url = req.query.url;

    if (!isValidUrl(url)) {
      return res.status(400).send({ message: "Invalid YouTube video URL" });
    }

    const ytdlInfo = await ytdl.getInfo(url);

    const filteredFormats = ytdlInfo.formats.filter(
      (format) =>
        format.itag === 137 || format.itag === 22 || format.itag === 18
    );

    const videoData = {
      title: ytdlInfo.videoDetails.title,
      length: ytdlInfo.videoDetails.lengthSeconds,
      totalViews: ytdlInfo.videoDetails.viewCount,
      category: ytdlInfo.videoDetails.category,
      thumbnail: ytdlInfo.videoDetails.thumbnails[0].url,
      formats: filteredFormats.map((format) => ({
        itag: format.itag,
        url: format.url,
        qualityLabel: format.qualityLabel,
      })),
    };

    res.send(videoData);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Error fetching video information" });
  }
});

function isValidUrl(url) {
  const youtubeUrlRegex =
    /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?(v=)(.*)/;
  return youtubeUrlRegex.test(url);
}

app.listen(8061, () => {
  console.log(`Listening at: http://localhost:8061`);
});
