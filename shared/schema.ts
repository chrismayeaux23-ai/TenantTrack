import { pgTable, text, serial, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  landlordId: varchar("landlord_id").notNull(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const maintenanceRequests = pgTable("maintenance_requests", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull(),
  unitNumber: text("unit_number").notNull(),
  issueType: text("issue_type").notNull(), // Plumbing, HVAC, Electrical, Misc
  description: text("description").notNull(),
  urgency: text("urgency").notNull(), // Low, Med, Emergency
  tenantName: text("tenant_name").notNull(),
  tenantPhone: text("tenant_phone").notNull(),
  tenantEmail: text("tenant_email").notNull(),
  status: text("status").notNull().default("New"), // New, In-Progress, Completed
  photoUrls: text("photo_urls").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPropertySchema = createInsertSchema(properties).omit({ id: true, createdAt: true });
export const insertMaintenanceRequestSchema = createInsertSchema(maintenanceRequests).omit({ id: true, createdAt: true });

export type Property = typeof properties.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;

export type MaintenanceRequest = typeof maintenanceRequests.$inferSelect;
export type InsertMaintenanceRequest = z.infer<typeof insertMaintenanceRequestSchema>;

export type CreatePropertyRequest = Omit<InsertProperty, "landlordId">;
export type CreateMaintenanceRequest = Omit<InsertMaintenanceRequest, "status">;
export type UpdateRequestStatus = { status: string };

export type PropertyResponse = Property;
export type PropertiesListResponse = Property[];
export type MaintenanceRequestResponse = MaintenanceRequest;
export type MaintenanceRequestsListResponse = MaintenanceRequest[];
