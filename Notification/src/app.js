import express from "express";
import sendMail from "./utils/email.js";
const app = express();

sendMail(
  "manavnk37@gmail.com",
  "Test Subject",
  "Test Text",
  "<h1>This is a test email from Spotify-REGO</h1>",
);

export default app;
