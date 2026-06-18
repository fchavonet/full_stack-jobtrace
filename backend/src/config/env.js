import dotenv from "dotenv";

dotenv.config();

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: process.env.PORT || "4000",
  databaseUrl: process.env.DATABASE_URL || ""
};

export default env;
