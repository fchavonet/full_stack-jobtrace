import app from "./app.js";
import env from "./config/env.js";

app.listen(env.port, function () {
  console.log("Server is running on port " + env.port + ".");
});
