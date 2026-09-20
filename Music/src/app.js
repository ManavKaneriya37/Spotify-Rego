import express from "express";
const app = express();
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cors from "cors";

import MusicRoutes from "./routes/music.routes.js";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use("/api/music", MusicRoutes);
export default app;
