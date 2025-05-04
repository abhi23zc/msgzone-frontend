"use client";

import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";

export const useFetch = (url, options = {}) => {
  const [triggerFetch, setTriggerFetch] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const tokenRef = useRef(null);


  useEffect(() => {
    const getCookieValue = (name) => {
      const cookies = document.cookie.split("; ");
      for (const cookie of cookies) {
        const [key, value] = cookie.split("=");
        if (key === name) return value;
      }
      return null;
    };
    tokenRef.current = getCookieValue("token");
  }, []);

  const { method = "GET", headers = {}, body = null } = options;

  useEffect(() => {
    if (!triggerFetch) return;
    console.log("Sending Request....")
    console.log(body)


    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenRef.current}`,
            ...headers,
          },
          ...(body && { body: JSON.stringify(body) }),
        });

        const result = await response.json();
        // console.log(result)
        if (result?.success) {
          setData(result);
          setError(null);
        } else {
          toast.error(result?.message || "Unknown error")
          console.log(result)
          setError(result?.message || "Unknown error");
        }
      } catch (err) {
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
        setTriggerFetch(false);
      }
    };

    fetchData();
  }, [triggerFetch]);

  const trigger = () => setTriggerFetch(true);

  return [data, loading, error, trigger];
};
