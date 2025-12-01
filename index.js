import { createReadStream, statSync } from "fs";
import { readFile } from "fs/promises";
import { createServer } from "http";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const PORT = 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const homePage = "home.html";
const cssFile = "style.css";
const video = "big-buck-bunny-4k.mp4";

console.log(join(__dirname, homePage));

const server = createServer(async (req, res) => {
  try {
    if (req.method == "GET") {
      let page;
      let css;
      let file;

      if (req.url === "/home" || req.url === "/") {
        page = join(__dirname, homePage);
        const data = await readFile(page);

        res.statusCode = 200;
        res.setHeader("Content-Type", "text/html");
        res.write(data);
        res.end();
      } else if (req.url === "/style") {
        css = join(__dirname, cssFile);
        const data = await readFile(css);

        res.statusCode = 200;
        res.setHeader("Content-Type", "text/css");
        res.write(data);
        res.end();
      } else if (req.url === "/video") {
        file = join(__dirname, "videos", video);

        const stat = statSync(file);
        const fileSize = stat.size;
        const range = req.headers.range;

        if (range) {
          const parts = range.replace(/bytes=/, "").split("-");

          const start = parseInt(parts[0], 10);

          const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

          const chunkSize = end - start + 1;

          const data = createReadStream(file, { start, end });

          const head = {
            "Content-Range": `bytes ${start}-${end}/${fileSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": chunkSize,
            "Content-Type": "video/mp4",
          };

          res.writeHead(206, head);
          data.pipe(res);
        }
      } else {
        res.writeHead(404, { "content-type": "text/json" });
        res.write(JSON.stringify({ message: "Not Found" }));
        res.end();
      }
    }
  } catch (error) {
    res.writeHead(500, { "content-type": "application/json" });
    res.write(JSON.stringify({ message: "The server is down" }));
    res.end();
    console.error(error);
  }
});

server.listen(PORT, () => {
  console.log(`Server running at ${PORT}`);
});
