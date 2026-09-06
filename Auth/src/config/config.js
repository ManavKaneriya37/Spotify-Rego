import { config as dotEnvConfig } from "dotenv";
dotEnvConfig();

const _config = {
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
};

export default Object.freeze(_config);
