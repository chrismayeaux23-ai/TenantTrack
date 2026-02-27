import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { MaintenanceStaff } from "@shared/schema";

export function useStaff() {
  return useQuery<MaintenanceStaff[]>({
    queryKey: ["/api/staff"],
    queryFn: async () => {
      const res = await fetch("/api/staff", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch staff");
      return res.json();
    },
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; email: string; phone?: string }) => {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create staff");
      }
      return res.json() as Promise<MaintenanceStaff>;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/staff"] }),
  });
}

export function useDeleteStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/staff/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete staff");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/staff"] }),
  });
}

export function useAssignRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ requestId, staffId }: { requestId: number; staffId: number }) => {
      const res = await fetch(`/api/requests/${requestId}/assign`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffId }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to assign request");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/requests"] }),
  });
}
