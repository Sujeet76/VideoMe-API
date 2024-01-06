import app from "./app.js";
import { connectToDB } from "./db/connectToDB.js";

const PORT = process.env.PORT || 5000;
connectToDB()
  .then(() => {
    app.listen(PORT!, () => {
      console.log(
        `⚙️ App is running at port number http://localhost:${PORT} ⚔️`
      );
    });
  })
  .catch((error) => {
    console.log("🔴🚨 Error while connecting to db and running port ");
    console.log(error);
  });
