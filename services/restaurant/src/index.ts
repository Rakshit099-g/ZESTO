import dotenv from "dotenv"
dotenv.config()
import express from 'express'

import connectDB from './config/db.js';

import restaurantRoutes  from './routes/restaurant.js'
import itemRoutes from './routes/menuItem.js'
import cors from "cors"
import cookieParser from 'cookie-parser'


const app = express()
const PORT = process.env.PORT || 5001
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser())
app.use(express.json())
app.use("/api/restaurant",restaurantRoutes);
app.use("/api/item",itemRoutes)
const start = async () => {
  await connectDB();
  app.listen(PORT, () => console.log(`Restaurant service is running on port ${PORT}`));
};
start();