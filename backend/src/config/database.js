import pg from "pg";

import env from "./env.js";

const { Pool } = pg;

const databasePool = new Pool({
  connectionString: env.databaseUrl
});

export default databasePool;
