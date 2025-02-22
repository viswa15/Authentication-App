import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import {connectDB} from "./db/connectDB.js";
import authRoute from "./routes/auth.route.js";
import cors from "cors"
import path from "path";

const app = express();
const __dirname = path.resolve();
app.use(express.json());
dotenv.config();
app.use(cookieParser());

app.use(cors({
        origin : "http://localhost:5173",
        credentials : true
}
))

const PORT = process.env.PORT || 5000;
app.use("/api/auth",authRoute);

if (process.env.NODE_ENV === "production") {
    // app.use(express.static(path.join(__dirname, "/frontend/dist")));

    app.use(express.static(path.join(__dirname, "/frontend/dist"), {
        setHeaders: (res, path) => {
            if (path.endsWith('.js')) {
                res.setHeader('Content-Type', 'application/javascript');
            }
        }
    }));

    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
    });
}

app.listen(PORT, () => {
    console.log("Server started on port :",PORT);
    connectDB();
});