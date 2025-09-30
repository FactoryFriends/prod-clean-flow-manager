import { useQuery, keepPreviousData, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys } from "./queryKeys";
import { useEffect, useRef } from "react";
export function useInternalDispatchRecords(location?: string) {
  const queryClient = useQueryClient();
  const instanceIdRef = useRef(Math.random().toString(36).slice(2));

  useEffect(() => {
    const channelName = `internal-dispatch-realtime-${location ?? 'all'}-${instanceIdRef.current}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'dispatch_records' },
        (payload) => {
          const newRec = (payload as any).new as any;
          const oldRec = (payload as any).old as any;
          const isInternal = newRec?.dispatch_type === 'internal' || oldRec?.dispatch_type === 'internal';
          const locationMatch = location ? (newRec?.location === location || oldRec?.location === location) : true;
          if (isInternal && locationMatch) {
            queryClient.invalidateQueries({ queryKey: queryKeys.dispatch.internal(location) });
          }
        }
      );

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [location, queryClient]);

  return useQuery({
    queryKey: queryKeys.dispatch.internal(location),
    queryFn: async () => {
      let query = supabase
        .from("dispatch_records")
        .select(`
          *,
          dispatch_items (*)
        `)
        .eq("dispatch_type", "internal")
        .eq("status", "draft")
        .order("created_at", { ascending: false });

      if (location) {
        query = query.eq("location", location);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching internal dispatch records:", error);
        throw error;
      }
      
      return data || [];
    },
    placeholderData: keepPreviousData,
    staleTime: 5000,
    refetchOnWindowFocus: false,
  });
}