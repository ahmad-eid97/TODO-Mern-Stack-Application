import env from "./config/env.js";
import connectToDatabase from "./database/connection.js";
import app from "./app.js";

await connectToDatabase();

app.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT}`);
});
