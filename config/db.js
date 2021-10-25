const mongoose = require("mongoose");

mongoose
    .connect('mongodb+srv://' + process.env.DB_USER_PASS +'@worldwaterforum-preprod.ehbrf.mongodb.net/worldwaterforum')
    .then(()=> console.log("connected to mongoDB"))
    .catch((err)=> console.log("failed to connect to mongoDb", err));
