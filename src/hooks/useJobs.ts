import client from "@/api/client";
import { useEffect, useState } from "react";

export function useJobs() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      console.log("Client instance:", client);

      try {
        const { data, error } = await client.from("jobs").select("*");

        if (error) {
          console.error("❌ Error fetching jobs:", error);
          setJobs([]);
        } else {
          setJobs(data || []);
        }

        console.log("🟡 useJobs: Request completed:", { data, error });
      } catch (err) {
        console.error("🚨 Unexpected error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  return { jobs, isLoading };
}
