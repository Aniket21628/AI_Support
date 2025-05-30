import { inferAsyncReturnType } from "@trpc/server";
import { verify } from "jsonwebtoken"

export async function createContext({ req }: { req: any }) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  let user = null;
  if (token) {
    try {
      user = verify(token, process.env.JWT_SECRET!) as { id: string };
    } catch (error) {
      console.error("JWT verification failed:", error);
    }
  }
  return {
    user,
    io: req.app.get("io"), // Assuming Socket.IO is set up
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;