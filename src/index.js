import { appConfig } from "./config/app.config.js";
import { validateEnvironment } from "./config/env.config.js";

validateEnvironment();

const { default: app } = await import("./app.js");

app.listen(appConfig.port, () => {
  console.log(`Server listening on port ${appConfig.port}`);
});
