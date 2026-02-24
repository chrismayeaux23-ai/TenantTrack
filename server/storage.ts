import { db } from "./db";
import {
  properties, maintenanceRequests,
  type Property, type InsertProperty, type CreatePropertyRequest,
  type MaintenanceRequest, type InsertMaintenanceRequest, type CreateMaintenanceRequest,
  type UpdateRequestStatus
} from "@shared/schema";
import { eq, inArray } from "drizzle-orm";

export interface IStorage {
  getProperties(landlordId: string): Promise<Property[]>;
  getProperty(id: number): Promise<Property | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  
  getRequestsByLandlord(landlordId: string): Promise<MaintenanceRequest[]>;
  createRequest(request: InsertMaintenanceRequest): Promise<MaintenanceRequest>;
  updateRequestStatus(id: number, status: string): Promise<MaintenanceRequest>;
}

export class DatabaseStorage implements IStorage {
  async getProperties(landlordId: string): Promise<Property[]> {
    return await db.select().from(properties).where(eq(properties.landlordId, landlordId));
  }

  async getProperty(id: number): Promise<Property | undefined> {
    const [property] = await db.select().from(properties).where(eq(properties.id, id));
    return property;
  }

  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const [property] = await db.insert(properties).values(insertProperty).returning();
    return property;
  }

  async getRequestsByLandlord(landlordId: string): Promise<MaintenanceRequest[]> {
    const rows = await db.select({ request: maintenanceRequests })
      .from(maintenanceRequests)
      .innerJoin(properties, eq(maintenanceRequests.propertyId, properties.id))
      .where(eq(properties.landlordId, landlordId));
      
    return rows.map(r => r.request);
  }

  async createRequest(insertRequest: InsertMaintenanceRequest): Promise<MaintenanceRequest> {
    const [request] = await db.insert(maintenanceRequests).values(insertRequest).returning();
    return request;
  }

  async updateRequestStatus(id: number, status: string): Promise<MaintenanceRequest> {
    const [request] = await db.update(maintenanceRequests)
      .set({ status })
      .where(eq(maintenanceRequests.id, id))
      .returning();
    return request;
  }
}

export const storage = new DatabaseStorage();
