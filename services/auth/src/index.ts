import express from "express"
import dotenv from "dotenv"
import connectDB from "./config/db.js"
import authRoute from "./routes/auth.js"
import cors from "cors"
import cookieParser from "cookie-parser"
dotenv.config()

const app = express()
app.use(express.json())
app.use(cookieParser())
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/auth",authRoute)

const PORT = process.env.PORT || 5000
app.listen(PORT,()=>{
    console.log(`Auth sevice is running on port ${PORT}`);
    connectDB();
});