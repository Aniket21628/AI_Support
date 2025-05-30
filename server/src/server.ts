import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./trpc/router";
import { createServer } from "http";
import { Server } from "socket.io";
import { getAIResponse } from "./ai/index";
import { prisma } from "../src/prisma"
import { initPinecone } from "./ai/index";

// Extend Express Request interface to include 'user'
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(
  "/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext: ({ req }) => ({ user: req.user, io }),
  })
);

io.on("connection", (socket) => {
  socket.on("user_message", async ({ message }) => {
    const response = await getAIResponse(message);
    socket.emit("bot_response", { message: response });
  });
});

async function startServer() {
  await initPinecone(); // Initialize Pinecone index
  server.listen(3001, () => {
    console.log("Server running on http://localhost:3001");
  });
}

startServer();