import "dotenv/config";
import { app } from "./app.js";
import { connectDB } from "./config/db.js";

const port = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`API running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error(`API startup failed: ${error.message}`);
    process.exit(1);
  });
