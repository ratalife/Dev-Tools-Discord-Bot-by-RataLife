import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import "./bot/index";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/bot/status", (req, res) => {
    res.json({ status: "active", timestamp: new Date().toISOString() });
  });

  app.get("/api/tickets", async (req, res) => {
    try {
      const tickets = await storage.getActiveTickets();
      res.json(tickets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tickets" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
