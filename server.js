const express = require("express");
const cors = require("cors");
const path = require("path");
const expressSession = require("express-session");

const app = express();
const http = require("http").createServer(app);

// session setup
const session = expressSession({
  secret: "coding is amazing",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
});

// Express App Config
app.use(express.json());
app.use(session);
app.use(express.static("public"));

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.resolve(__dirname, "public")));
} else {
  const corsOptions = {
    origin: [
      "http://127.0.0.1:8080",
      "http://localhost:8080",
      "http://127.0.0.1:3000",
      "http://localhost:3000",
    ],
    credentials: true,
  };
  app.use(cors(corsOptions));
}

const domainRoutes = require("./api/domain/domain.routes");

app.use("/api/domain", domainRoutes);

app.get("/**", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const port = process.env.PORT || 3030;
http.listen(port, () => {
  console.log("Server is running on port: " + port);
});
