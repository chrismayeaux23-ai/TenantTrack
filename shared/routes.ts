import { z } from 'zod';
import { insertPropertySchema, insertMaintenanceRequestSchema, insertMaintenanceStaffSchema, properties, maintenanceRequests, maintenanceStaff } from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
  unauthorized: z.object({ message: z.string() })
};

export const api = {
  properties: {
    list: {
      method: 'GET' as const,
      path: '/api/properties' as const,
      responses: {
        200: z.array(z.custom<typeof properties.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/properties/:id' as const,
      responses: {
        200: z.custom<typeof properties.$inferSelect>(),
        404: errorSchemas.notFound,
      }
    },
    create: {
      method: 'POST' as const,
      path: '/api/properties' as const,
      input: insertPropertySchema.omit({ landlordId: true }),
      responses: {
        201: z.custom<typeof properties.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
  },
  requests: {
    list: {
      method: 'GET' as const,
      path: '/api/requests' as const,
      responses: {
        200: z.array(z.custom<typeof maintenanceRequests.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/requests' as const,
      input: insertMaintenanceRequestSchema.omit({ status: true }),
      responses: {
        201: z.custom<typeof maintenanceRequests.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/requests/:id/status' as const,
      input: z.object({ status: z.string() }),
      responses: {
        200: z.custom<typeof maintenanceRequests.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
    assign: {
      method: 'PATCH' as const,
      path: '/api/requests/:id/assign' as const,
      input: z.object({ staffId: z.number() }),
      responses: {
        200: z.custom<typeof maintenanceRequests.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
    track: {
      method: 'GET' as const,
      path: '/api/requests/track/:code' as const,
      responses: {
        200: z.object({
          id: z.number(),
          unitNumber: z.string(),
          issueType: z.string(),
          description: z.string(),
          urgency: z.string(),
          status: z.string(),
          createdAt: z.string().nullable(),
          propertyName: z.string(),
        }),
        404: errorSchemas.notFound,
      },
    },
  },
  staff: {
    list: {
      method: 'GET' as const,
      path: '/api/staff' as const,
      responses: {
        200: z.array(z.custom<typeof maintenanceStaff.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/staff' as const,
      input: insertMaintenanceStaffSchema.omit({ landlordId: true }),
      responses: {
        201: z.custom<typeof maintenanceStaff.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/staff/:id' as const,
      responses: {
        200: z.object({ message: z.string() }),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type PropertyInput = z.infer<typeof api.properties.create.input>;
export type PropertyResponse = z.infer<typeof api.properties.create.responses[201]>;
export type PropertiesListResponse = z.infer<typeof api.properties.list.responses[200]>;

export type MaintenanceRequestInput = z.infer<typeof api.requests.create.input>;
export type MaintenanceRequestResponse = z.infer<typeof api.requests.create.responses[201]>;
export type MaintenanceRequestsListResponse = z.infer<typeof api.requests.list.responses[200]>;
export type UpdateRequestStatusInput = z.infer<typeof api.requests.updateStatus.input>;
export type AssignRequestInput = z.infer<typeof api.requests.assign.input>;
export type TrackRequestResponse = z.infer<typeof api.requests.track.responses[200]>;

export type StaffInput = z.infer<typeof api.staff.create.input>;
export type StaffResponse = z.infer<typeof api.staff.create.responses[201]>;
export type StaffListResponse = z.infer<typeof api.staff.list.responses[200]>;
