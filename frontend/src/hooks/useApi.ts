import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  energyApi,
  waterApi,
  wasteApi,
  targetApi,
  dashboardApi,
  type MetricInput,
  type TargetInput,
} from "@/services/api";

// Dashboard summary
export function useDashboardSummary(params?: { month?: string; year?: number; location?: string }) {
  return useQuery({
    queryKey: ["dashboard-summary", params],
    queryFn: () => dashboardApi.getSummary(params),
  });
}

// Highest usage locations
export function useHighestUsage(params?: { year?: number }) {
  return useQuery({
    queryKey: ["highest-usage", params],
    queryFn: () => dashboardApi.getHighestUsage(params),
  });
}

// Generic metric hook factory
function createMetricHooks(
  key: string,
  api: typeof energyApi
) {
  return {
    useAll: (params?: { year?: number; month?: string; location?: string }) =>
      useQuery({
        queryKey: [key, params],
        queryFn: () => api.getAll(params),
      }),
    useCreate: () => {
      const qc = useQueryClient();
      return useMutation({
        mutationFn: (data: MetricInput) => api.create(data),
        onSuccess: () => qc.invalidateQueries({ queryKey: [key] }),
      });
    },
    useUpdate: () => {
      const qc = useQueryClient();
      return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<MetricInput> }) =>
          api.update(id, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: [key] }),
      });
    },
    useDelete: () => {
      const qc = useQueryClient();
      return useMutation({
        mutationFn: (id: string) => api.delete(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: [key] }),
      });
    },
  };
}

export const energyHooks = createMetricHooks("energy", energyApi);
export const waterHooks = createMetricHooks("water", waterApi);
export const wasteHooks = createMetricHooks("waste", wasteApi);

// Targets
export function useTargets(params?: { year?: number; metric?: string; location?: string }) {
  return useQuery({
    queryKey: ["targets", params],
    queryFn: () => targetApi.getAll(params),
  });
}

export function useCreateTarget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TargetInput) => targetApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["targets"] }),
  });
}

export function useUpdateTarget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TargetInput> }) =>
      targetApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["targets"] }),
  });
}

export function useDeleteTarget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => targetApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["targets"] }),
  });
}

// Snapshots
export function useSnapshots(params?: { year?: number; metric?: string }) {
  return useQuery({
    queryKey: ["snapshots", params],
    queryFn: () => dashboardApi.getSnapshots(params),
  });
}

export function useGenerateSnapshot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ month, year }: { month: string; year: number }) =>
      dashboardApi.generateSnapshot(month, year),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["snapshots"] }),
  });
}