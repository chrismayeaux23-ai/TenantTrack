import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Set up Replit integrations first
  await setupAuth(app);
  registerAuthRoutes(app);
  registerObjectStorageRoutes(app);

  app.get(api.properties.list.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const props = await storage.getProperties(userId);
      res.json(props);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  app.get(api.properties.get.path, async (req, res) => {
    try {
      const prop = await storage.getProperty(Number(req.params.id));
      if (!prop) {
        return res.status(404).json({ message: "Property not found" });
      }
      res.json(prop);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch property" });
    }
  });

  app.post(api.properties.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.properties.create.input.parse(req.body);
      const userId = req.user.claims.sub;
      const prop = await storage.createProperty({ ...input, landlordId: userId });
      res.status(201).json(prop);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Failed to create property" });
    }
  });

  app.get(api.requests.list.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const requests = await storage.getRequestsByLandlord(userId);
      res.json(requests);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch requests" });
    }
  });

  app.post(api.requests.create.path, async (req, res) => {
    try {
      const bodySchema = api.requests.create.input.extend({
        propertyId: z.coerce.number()
      });
      const input = bodySchema.parse(req.body);
      
      const prop = await storage.getProperty(input.propertyId);
      if (!prop) {
         return res.status(404).json({ message: "Property not found" });
      }
      
      const request = await storage.createRequest({ ...input, status: "New" });
      res.status(201).json(request);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Failed to create request" });
    }
  });

  app.patch(api.requests.updateStatus.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.requests.updateStatus.input.parse(req.body);
      const request = await storage.updateRequestStatus(Number(req.params.id), input.status);
      res.json(request);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Failed to update request" });
    }
  });

  return httpServer;
}
