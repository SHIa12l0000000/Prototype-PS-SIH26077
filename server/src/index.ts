import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

import healthRoutes from "./routes/healthRoutes.js";
import newsRoutes from "./routes/newsRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import modelsRoutes from "./routes/modelsRoutes.js";
import autonomousRoutes from "./routes/autonomousRoutes.js";
import agentRoutes from "./routes/agentRoutes.js";
import postRoutes from "./routes/postRoutes.js";

import { logger } from "./utils/logger.js";


dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;


// Middleware

app.use(
  helmet({
    contentSecurityPolicy: false
  })
);


app.use(
  cors({
    origin: "*",
    methods: [
      "GET",
      "POST",
      "PUT",
      "DELETE",
      "OPTIONS"
    ],
    allowedHeaders: [
      "Content-Type",
      "Authorization"
    ]
  })
);


app.use(express.json());


// Logger

app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});



// Routes

app.use("/api", healthRoutes);

app.use("/api", newsRoutes);

app.use("/api", analyticsRoutes);

app.use("/api", modelsRoutes);

app.use("/api", autonomousRoutes);

app.use("/api/agent", agentRoutes);

app.use("/api", postRoutes);



// Root

app.get("/", (_req, res) => {

  res.json({

    message:
      "Welcome to TechPulse AI Intelligence & Trend API",

    endpoints: {

      health: "/api/health",

      news: "/api/news",

      posts: "/api/posts",

      analytics: "/api/analytics",

      modelStatus:
        "/api/models/status",

      autonomous:
        "/api/autonomous/status",

      agent:
        "/api/agent/init"

    }

  });

});



// 404

app.use((_req, res)=>{

  res.status(404).json({

    success:false,

    error:"API Endpoint Not Found"

  });

});



// Error Handler

app.use(
(
 err:any,
 _req:express.Request,
 res:express.Response,
 _next:express.NextFunction
)=>{

 logger.error(
   "Unhandled server error:",
   err
 );


 res.status(500).json({

   success:false,

   error:"Internal Server Error"

 });

});



// Start Server

app.listen(PORT,()=>{

 logger.info(
 `⚡ TechPulse AI Express Server running on port ${PORT}`
 );

});