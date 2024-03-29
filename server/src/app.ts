import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import scriptRoutes from "./routes/scripts";
import userRoutes from "./routes/users";
import uploadRoutes from "./routes/upload";
import morgan from "morgan";
import createHttpError, { isHttpError } from "http-errors";
import session from "express-session";
import env from "./util/validateEnv";
import MongoStore  from "connect-mongo";
//import bodyParser from "body-parser";

const app = express();

/*
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(bodyParser.json());
*/

app.use(morgan("dev"));

app.use(express.json());

app.use(session({
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60 * 60 * 1000,
    },
    rolling: true,
    store: MongoStore.create({
        mongoUrl: env.MONGO_CONNECTION_STRING
    }),
}))

app.use("/api/users", userRoutes);
app.use("/api/scripts", scriptRoutes);
app.use("/api/upload",  uploadRoutes);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
    console.error(error);
    let errorMessage = "An unknown error occurred";
    let statusCode = 500;
    if (isHttpError(error)){
        statusCode = error.status;
        errorMessage = error.message;
    } 
    res.status(statusCode).json({ error: errorMessage });
});

//use for reference and testing purposes
app.use((req, res, next) => {
  next(createHttpError(404, "Endpoint not found"));
});

export default app;