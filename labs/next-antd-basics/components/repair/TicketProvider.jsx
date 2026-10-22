"use client";
import {createContext, useContext, useState} from 'react';
import {initialTickets, saveTicket, validateTicket} from '../../lib/tickets.js';
const TicketContext = createContext(null);
export function TicketProvider({children}) {
  const [tickets, setTickets] = useState(initialTickets);
  function save(values, existingId) {
    validateTicket(values);
    const id = existingId ?? `BX-${crypto.randomUUID().slice(0, 8)}`;
    const date = new Date().toISOString().slice(0, 10);
    setTickets(previous => saveTicket(previous, values, id, date));
    return id;
  }
  function remove(id) {
    setTickets(previous => previous.filter(item => item.id !== id));
  }
  return <TicketContext.Provider value={{tickets, save, remove}}>{children}</TicketContext.Provider>;
}
export function useTickets() {
  const context = useContext(TicketContext);
  if (!context) throw new Error('工单组件必须位于 TicketProvider 内');
  return context;
}
