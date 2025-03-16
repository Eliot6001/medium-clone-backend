import expressInstance from 'express'
import articleRoutes from './routes/articleRoutes'
import authRoutes from './routes/authRoutes'
import { authMiddleware } from './middlewares/authMiddleware';
import bodyParser from "body-parser";
import morgan from 'morgan'
import helmet from 'helmet';
import cors from 'cors';
//uploadthing setup
import { uploadRouter } from "./controllers/mediaController";
import { createRouteHandler } from "uploadthing/express";

const app = expressInstance();

var corsOptions = {
  origin: process.env.FRONTEND_URL,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

console.log(process.env.FRONTEND_URL)
//security stuff
app.use(helmet());
app.use(cors(corsOptions));

//logging
app.use(morgan('combined'));

//Might add a rate limiter 

// Middleware to parse JSON
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// Routes
app.use('/articles', articleRoutes);
app.use('/auth', authRoutes);
app.use(
  "/api/uploadthing",
  createRouteHandler({
    router: uploadRouter,
    config: { token: process.env.UPLOADTHING_TOKEN, isDev: true },
  }),
);

app.use((err: Error, req: expressInstance.Request, res: expressInstance.Response, next: expressInstance.NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

module.exports = app;
