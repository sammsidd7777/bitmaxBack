const express = require("express");
const adminDashboard = require("../controller/adminController");

const route = express.Router();

route.get("/dashboard",adminDashboard);

module.exports= route;