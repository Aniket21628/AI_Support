import { initTRPC } from "@trpc/server";
import { z } from "zod";
import { prisma } from "../prisma";
import { getAIResponse } from "../ai/index";

type Context = {
  user: {
    id: string;
    // add other user properties if needed
  };
  io: any; // type this properly if possible
};

const t = initTRPC.context<Context>().create();

export const appRouter = t.router({
  ticket: t.router({
    create: t.procedure
      .input(z.object({ title: z.string(), description: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const ticket = await prisma.ticket.create({
          data: {
            title: input.title,
            description: input.description,
            userId: ctx.user.id,
          },
        });

        // AI ticket analysis
        const aiSummary = await getAIResponse(`Summarize this ticket: ${input.description}`);
        await prisma.ticket.update({
          where: { id: ticket.id },
          data: { aiSummary },
        });

        return ticket;
      }),
    getUserTickets: t.procedure.query(async ({ ctx }) => {
      return prisma.ticket.findMany({ where: { userId: ctx.user.id } });
    }),
  }),
  chat: t.router({
    escalate: t.procedure
      .input(z.object({ messages: z.array(z.object({ text: z.string(), isBot: z.boolean() })) }))
      .mutation(async ({ input, ctx }) => {
        const ticket = await prisma.ticket.create({
          data: {
            title: "Escalated Chat",
            description: JSON.stringify(input.messages),
            userId: ctx.user.id,
            status: "ESCALATED",
          },
        });

        // Notify agents
        ctx.io.emit("new_escalation", { ticketId: ticket.id });
        return ticket;
      }),
  }),
});

export type AppRouter = typeof appRouter;