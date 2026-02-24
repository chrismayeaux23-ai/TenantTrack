import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type PropertyInput } from "@shared/routes";

export function useProperties() {
  return useQuery({
    queryKey: [api.properties.list.path],
    queryFn: async () => {
      const res = await fetch(api.properties.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch properties");
      return api.properties.list.responses[200].parse(await res.json());
    },
  });
}

export function useProperty(id?: number) {
  return useQuery({
    queryKey: [api.properties.get.path, id],
    queryFn: async () => {
      if (!id) return null;
      const url = api.properties.get.path.replace(":id", id.toString());
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) throw new Error("Property not found");
      if (!res.ok) throw new Error("Failed to fetch property");
      return api.properties.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: PropertyInput) => {
      const res = await fetch(api.properties.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create property");
      return api.properties.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.properties.list.path] }),
  });
}
