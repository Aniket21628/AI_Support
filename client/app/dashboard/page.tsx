"use client";
import { useSession } from "next-auth/react";
import { trpc } from "../../lib/trpc";
import { Key, ReactElement, JSXElementConstructor, ReactNode, ReactPortal } from "react";

export default function Dashboard() {
  const { data: session } = useSession();
  const { data: tickets } = trpc.ticket.getUserTickets.useQuery();

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="text-xl font-semibold mb-4">Welcome, {session?.user?.name}</div>
        <div>
          <h2 className="text-lg font-medium mb-2">Your Tickets</h2>
          <div className="space-y-2">
            {tickets?.map((ticket: {
              id: Key | null | undefined;
              title: ReactNode;
              status: ReactNode;
            }) => (
              <div
                key={ticket.id}
                className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition"
              >
                <p className="font-medium">{ticket.title}</p>
                <p className="text-sm text-gray-600">Status: {ticket.status}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
