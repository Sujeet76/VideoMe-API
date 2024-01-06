import { connect } from "mongoose";
import { DB_NAME } from "../constant.js";
import dotenv from "dotenv";
dotenv.config({
  path: "../../.env",
});

export const connectToDB = async () => {
  try {
    console.log(process.env.BD_URL!);
    const connectionInstance = await connect(process.env.BD_URL!, {
      dbName: DB_NAME,
    });
    console.log(
      `🟢  Connected to database`,
      connectionInstance.connection.host
    );
  } catch (error) {
    console.log(`🔴🚨  Error while connecting to db: ${error}`);
    process.exit(1);
  }
};
