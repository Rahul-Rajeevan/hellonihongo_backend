const express = require("express");
const { authRouter } = require("./routes/authRoutes");
const dotenv = require('dotenv')
const cors = require('cors')
const connectDB = require('./config/db'); // <-- Import connectDB

dotenv.config();
 
// Connect to Database
connectDB(); // <-- Call the connection function

const app = express();
app.use(cors())

app.use(express.json());
app.use("/auth", authRouter)

app.get("/", (req, res) => {
    res.send("<h1>Hello</h1>");
})


const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Listening on port ${port}....`);
})