"use client";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardContent } from "../../../client/src/components/ui/card";
import { trpc } from "../../lib/trpc";
import { Key, ReactElement, JSXElementConstructor, ReactNode, ReactPortal } from "react";

export default function Dashboard() {
  const { data: session } = useSession();
  const { data: tickets } = trpc.ticket.getUserTickets.useQuery();

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>Welcome, {session?.user?.name}</CardHeader>
        <CardContent>
          <h2>Your Tickets</h2>
          {tickets?.map((ticket: { id: Key | null | undefined; title: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; status: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; }) => (
            <div key={ticket.id} className="p-2 border-b">
              <p>{ticket.title}</p>
              <p>Status: {ticket.status}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}