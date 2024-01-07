import { connect } from "mongoose";
import { DB_NAME } from "../constant.js";
import dotenv from "dotenv";
dotenv.config({
  path: "../../.env",
});

export const connectToDB = async () => {
  try {
    const connectionInstance = await connect(process.env.BD_URL!, {
      dbName: DB_NAME,
    });
    console.log(
      `🟢  Connected to database and host id : `,
      connectionInstance.connection.host
    );
  } catch (error) {
    console.log(`🔴🚨  Error while connecting to db: ${error}`);
    process.exit(1);
  }
};
