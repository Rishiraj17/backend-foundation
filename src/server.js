const express = require("express");
require("dotenv").config();

const connectDB= require("./config/db");
const userRoutes=require("./routes/user.routes");
const errorHandler=require("./middleware/error.middleware");
const helmet = require("helmet");
const morgan = require("morgan")
const sanitizeBody = require("./middleware/sanitize.middleware");

const app = express();

const PORT=process.env.PORT || 5000;


//middleware to parse JSON
app.use(express.json());

app.use(sanitizeBody);

app.use(helmet());

//status
app.use(morgan("dev"));

//routes
app.use("/users",userRoutes);

//error handling middleware (MUST be after routes)
app.use(errorHandler);

const startServer= async()=>{

    await connectDB();

    app.listen(PORT,()=>{
        console.log(`Server running on port ${PORT}`);
    });

};


startServer();