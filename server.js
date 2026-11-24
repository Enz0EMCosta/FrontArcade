const { createServer } = require("node:http");
const { readFile } = require("node:fs/promises");
const { join } = require("node:path");

const assets = new Map([
  ["/", ["index.html", "text/html"]],
  ["/index.html", ["index.html", "text/html"]],
  ["/styles.css", ["styles.css", "text/css"]],
  ["/art.js", ["art.js", "text/javascript"]],
  ["/app.js", ["app.js", "text/javascript"]],
  ["/olhar-afiado.js", ["olhar-afiado.js", "text/javascript"]],
  ["/popups-infinitos.js", ["popups-infinitos.js", "text/javascript"]],
  ["/lag-lab.js", ["lag-lab.js", "text/javascript"]],
  ["/site-builder.js", ["site-builder.js", "text/javascript"]],
  ["/builder.css", ["builder.css", "text/css"]],
  ["/site-preview.css", ["site-preview.css", "text/css"]],
  ["/pepi-bolota.js", ["pepi-bolota.js", "text/javascript"]],
  ["/pepi-scenery.js", ["pepi-scenery.js", "text/javascript"]],
  ["/pepi-bolota.css", ["pepi-bolota.css", "text/css"]],
  ["/pepi-companion.js", ["pepi-companion.js", "text/javascript"]],
  ["/pepi-companion.css", ["pepi-companion.css", "text/css"]],
  ["/assets/desktop-hills.webp", ["assets/desktop-hills.webp", "image/webp"]],
  ["/assets/lawd-wallpaper.png", ["assets/lawd-wallpaper.png", "image/png"]],
  ["/assets/lawd-enzo.webp", ["assets/lawd-enzo.webp", "image/webp"]],
  ["/assets/lawd-pedro.webp", ["assets/lawd-pedro.webp", "image/webp"]],
  ["/assets/lawd-lauane.webp", ["assets/lawd-lauane.webp", "image/webp"]],
  ["/assets/lawd-equipe.webp", ["assets/lawd-equipe.webp", "image/webp"]],
  ["/assets/MuseoModerno.ttf", ["assets/MuseoModerno.ttf", "font/ttf"]],
  ["/sobre/Enzo.txt", ["sobre/Enzo.txt", "text/plain"]],
  ["/sobre/PP.txt", ["sobre/PP.txt", "text/plain"]],
  ["/sobre/Curriculo-Enzo-Costa.pdf", ["sobre/Curriculo-Enzo-Costa.pdf", "application/pdf"]],
]);
// Pepi Bolota's recorded voice: any simple file name inside assets/pepi/ is allowed,
// so new clips work without editing this list. The pattern blocks paths like "../".
const voiceClip = /^\/assets\/pepi\/([\w-]+\.(mp3|ogg|wav|json))$/;
const voiceTypes = { mp3: "audio/mpeg", ogg: "audio/ogg", wav: "audio/wav", json: "application/json" };

function findAsset(path) {
  if (assets.has(path)) return assets.get(path);
  const clip = path.match(voiceClip);
  return clip ? [`assets/pepi/${clip[1]}`, voiceTypes[clip[2]]] : undefined;
}

const port = Number(process.env.PORT ?? 3000);
const server = createServer(async (request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" }).end();
    return;
  }

  const asset = findAsset(request.url.split("?")[0]);
  if (!asset) {
    response.writeHead(404).end();
    return;
  }

  const [file, mimeType] = asset;
  try {
    const contents = await readFile(join(__dirname, file));
    response.writeHead(200, {
      "Content-Type": mimeType.startsWith("text/") ? `${mimeType}; charset=utf-8` : mimeType,
      "Cache-Control": "no-cache",
    });
    response.end(request.method === "HEAD" ? undefined : contents);
  } catch (error) {
    if (error.code === "ENOENT") {
      response.writeHead(404).end();
      return;
    }
    console.error(error);
    response.writeHead(500).end();
  }
});

server.listen(port, "localhost", () => {
  console.log(`Front Arcade disponível em http://localhost:${server.address().port}`);
});
