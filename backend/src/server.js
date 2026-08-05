import app from "./app.js";
import env, {
  validateEnvironment
} from "./config/env.js";

validateEnvironment();

app.listen(env.port, function () {
  console.log(
    "Server is running on port " + env.port + "."
  );
});
