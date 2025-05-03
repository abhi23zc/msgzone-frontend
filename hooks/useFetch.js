"use client";
import { useEffect, useState } from "react";

export const useFetch = (url, options = {}) => {
  const [triggerFetch, setTriggerFetch] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { method = "GET", headers = {}, body = null } = options;

  useEffect(() => {
    if (!triggerFetch) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
          ...(body && { body: JSON.stringify(body) }),
        });

        const result = await response.json();
        if(result?.success){
          
          setData(result);
          setError(null);
        }
        else setError(result?.message)
      } catch (err) {
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
        setTriggerFetch(false); 
      }
    };

    fetchData();
  }, [triggerFetch, url, method, headers, body]);

  const trigger = () => setTriggerFetch(true);

  return [data, loading, error, trigger];
};
