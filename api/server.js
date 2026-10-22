const express = require("express");
const connectDB = require("../db/ConnectDb");
const dotenv = require("dotenv");
const errorMiddleware = require("../middleware/errorHandle");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const PORT = process.env.PORT || 5000

const app = express();


app.use(cookieParser());
dotenv.config();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(errorMiddleware);



let isDBConnected = false;

const makeConnection = async () => {

    if (isDBConnected == false) {
        connectDB(process.env.MONGOURL);
    }
    else {
        console.log("database not connected")
    }
};
makeConnection();


const authRoute = require("../router/authRoute");
const ticketRoute = require("../router/ticketRoute");
const adminRoute = require("../router/adminRoute");



app.use('/api/auth',authRoute);
app.use('/api/tickets',ticketRoute);
app.use('/api/admin',adminRoute);



app.listen(PORT, () => {
    console.log(`server runing on ${PORT}`)
});





