import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertConsentSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all consent records
  app.get("/api/consent-records", async (req, res) => {
    try {
      const records = await storage.getAllConsentRecords();
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch consent records" });
    }
  });

  // Get consent record by ID
  app.get("/api/consent-records/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const record = await storage.getConsentRecord(id);
      if (!record) {
        return res.status(404).json({ message: "Consent record not found" });
      }
      res.json(record);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch consent record" });
    }
  });

  // Search consent records
  app.get("/api/consent-records/search/:query", async (req, res) => {
    try {
      const query = req.params.query;
      const records = await storage.searchConsentRecords(query);
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: "Failed to search consent records" });
    }
  });

  // Get consent records by status
  app.get("/api/consent-records/status/:status", async (req, res) => {
    try {
      const status = req.params.status;
      const records = await storage.getConsentRecordsByStatus(status);
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch consent records by status" });
    }
  });

  // Create new consent record
  app.post("/api/consent-records", async (req, res) => {
    try {
      const validatedData = insertConsentSchema.parse(req.body);
      const record = await storage.createConsentRecord(validatedData);
      res.status(201).json(record);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create consent record" });
    }
  });

  // Update consent record
  app.put("/api/consent-records/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const record = await storage.updateConsentRecord(id, req.body);
      if (!record) {
        return res.status(404).json({ message: "Consent record not found" });
      }
      res.json(record);
    } catch (error) {
      res.status(500).json({ message: "Failed to update consent record" });
    }
  });

  // Delete consent record (revoke access)
  app.delete("/api/consent-records/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteConsentRecord(id);
      if (!success) {
        return res.status(404).json({ message: "Consent record not found" });
      }
      res.json({ message: "Consent record deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete consent record" });
    }
  });

  // Get consent statistics
  app.get("/api/consent-stats", async (req, res) => {
    try {
      const allRecords = await storage.getAllConsentRecords();
      const total = allRecords.length;
      const active = allRecords.filter(r => r.status === "active").length;
      const expiring = allRecords.filter(r => r.status === "expiring").length;
      const expired = allRecords.filter(r => r.status === "expired").length;

      res.json({
        total,
        active,
        expiring,
        expired,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch consent statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
