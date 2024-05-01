import http from "http"
import url from "url"

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const queryParams = parsedUrl.query;
  console.log(req.url)
  if (queryParams.local === "true") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        Actions: [
          {
            Name: "resize image",
            Type: "resize",
            options: {
              Width: 100,
              Height: 200,
              IgnoreAspectRatio: true,
            },
          },
          {
            Name: "convert to gzip",
            Type: "gzip",
            options: {
              Level: 1,
            },
          },
          {
            Name: "resize rename",
            Type: "rename",
            options: {
              FileNameFormat: "{0}-resize.{1}",
            },
          },
          {
            Name: "resize rename webp",
            Type: "rename",
            options: {
              FileNameFormat: "{0}-resize.{1}",
            },
          },
          {
            Name: "resize rename webp gzip",
            Type: "rename",
            options: {
              FileNameFormat: "{0}-resize-compressed-webp",
            },
          },
          {
            Name: "save resize in storage",
            Type: "save",
            options: {
              location:
                "F:\\AliBazregar\\BasisCore.Server.Node\\test\\fileStreamer\\output",
            },
          },
          {
            Name: "convert To webp",
            Type: "convert",
            options: {
              Format: "webp",
            },
          },
        ],
        Permissions: [
          {
            Mimes: ["video/mp4", "image/png"],
            MinSize: 1,
            MaxSize: 100000000,
          },
          {
            Mimes: [""],
            MinSize: 1,
            MaxSize: 640999,
          },
        ],
        Process: [
          [
            "select image/jpg",
            "resize image",
            "convert To webp",
            "resize rename webp",
            "save resize in storage",
          ],
          [
            "select image/png",
            "resize image",
            "convert To webp",
            "save resize in storage",
          ],
        ],
      })
    );
  } else {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        Actions: [
          {
            Name: "select image/jpg",
            Type: "selector",
            options: {
              mimes: ["image/jpg"],
            },
          },
          {
            Name: "select image/png",
            Type: "selector",
            options: {
              mimes: ["image/png"],
            },
          },
          {
            Name: "select image/jpeg",
            Type: "selector",
            options: {
              mimes: ["image/jpeg"],
            },
          },
          {
            Name: "select video/mp4",
            Type: "selector",
            options: {
              mimes: ["video/mp4"],
            },
          },
          {
            Name: "save in storage",
            Type: "save",
            options: {
              location:
                "F:\\AliBazregar\\BasisCore.Server.Node\\test\\fileStreamer\\original",
            },
          },
          {
            Name: "select text/css",
            Type: "selector",
            options: {
              mimes: ["text/css"],
            },
          },
          {
            Name: "select text/javascript",
            Type: "selector",
            options: {
              mimes: ["text/javascript"],
            },
          },
          {
            Name: "zip",
            Type: "gzip",
            options: {
              Level: 1,
            },
          },
          {
            Name: "save zip in storage",
            Type: "save",
            options: {
              location:
                "F:\\AliBazregar\\BasisCore.Server.Node\\test\\fileStreamer\\compressed",
            },
          },
          {
            Name: "select application/javascript",
            Type: "selector",
            options: {
              mimes: ["application/javascript"],
            },
          },
          {
            Name: "select application/x-javascript",
            Type: "selector",
            options: {
              mimes: ["application/x-javascript"],
            },
          },
          {
            Name: "zip rename",
            Type: "rename",
            options: {
              FileNameFormat: "{0}.{1}.zip",
            },
          },
          {
            Name: "select font/ttf",
            Type: "selector",
            options: {
              mimes: ["font/ttf"],
            },
          },
          {
            Name: "select application/x-font-ttf",
            Type: "selector",
            options: {
              mimes: ["application/x-font-ttf"],
            },
          },
          {
            Name: "select application/font-woff",
            Type: "selector",
            options: {
              mimes: ["application/font-woff"],
            },
          },
          {
            Name: "select application/x-font-woff",
            Type: "selector",
            options: {
              mimes: ["application/x-font-woff"],
            },
          },
          {
            Name: "select application/font-woff2",
            Type: "selector",
            options: {
              mimes: ["application/font-woff2"],
            },
          },
          {
            Name: "select application/vnd.ms-fontobject",
            Type: "selector",
            options: {
              mimes: ["application/vnd.ms-fontobject"],
            },
          },
          {
            Name: "select application/font-otf",
            Type: "selector",
            options: {
              mimes: ["application/font-otf"],
            },
          },
          {
            Name: "select image/svg+xml",
            Type: "selector",
            options: {
              mimes: ["image/svg+xml"],
            },
          },
        ],
        Permissions: [
          {
            Mimes: [
              "application/x-font-ttf",
              "font/ttf",
              "application/font-woff2",
              "application/x-javascript",
              "application/vnd.ms-fontobject",
              "image/png",
              "application/font-otf",
              "image/jpeg",
              "application/x-font-woff",
              "application/javascript",
              "image/jpg",
              "application/font-woff",
              "text/javascript",
              "text/css",
              "image/svg+xml",
            ],
            MinSize: 1,
            MaxSize: 5000000,
          },
        ],
      })
    );
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
