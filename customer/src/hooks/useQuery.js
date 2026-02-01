import { useState, useEffect } from "react";

// Module-level cache - shared across ALL components
const queryCache = new Map();
// Track in-flight requests to prevent duplicates
const inFlightRequests = new Map();

/**
 * Custom hook for caching API query results
 * Prevents redundant API calls by caching responses with TTL
 * @param {Function} queryFn - Async function that fetches data
 * @param {string} key - Unique cache key for this query
 * @param {Object} options - Configuration options
 * @param {number} options.ttl - Time to live in milliseconds (default: 5 minutes)
 * @param {boolean} options.enabled - Whether to run the query (default: true)
 * @returns {Object} { data, loading, error, refetch }
 */
export const useQuery = (queryFn, key, options = {}) => {
  const { ttl = 5 * 60 * 1000, enabled = true } = options;

  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
  });

  const refetch = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    // Check if there's already a request in-flight for this key
    if (inFlightRequests.has(key)) {
      // Wait for the existing request
      try {
        const result = await inFlightRequests.get(key);
        setState({
          data: result,
          loading: false,
          error: null,
        });
        return;
      } catch (err) {
        setState({
          data: null,
          loading: false,
          error: err.message,
        });
        return;
      }
    }

    // Start a new request
    const requestPromise = queryFn()
      .then((result) => {
        const now = Date.now();

        // Store in cache with timestamp
        queryCache.set(key, {
          data: result,
          timestamp: now,
        });

        // Remove from in-flight tracking
        inFlightRequests.delete(key);

        return result;
      })
      .catch((err) => {
        // Remove from in-flight tracking on error
        inFlightRequests.delete(key);
        throw err;
      });

    // Track this request
    inFlightRequests.set(key, requestPromise);

    try {
      const result = await requestPromise;
      setState({
        data: result,
        loading: false,
        error: null,
      });
    } catch (err) {
      setState({
        data: null,
        loading: false,
        error: err.message,
      });
    }
  };

  useEffect(() => {
    if (!enabled) return;

    const cached = queryCache.get(key);
    const now = Date.now();

    // If cache exists and is fresh, use it
    if (cached && now - cached.timestamp < ttl) {
      setState({
        data: cached.data,
        loading: false,
        error: null,
      });
      return;
    }

    // Otherwise fetch fresh data
    refetch();
  }, [key, enabled]);

  return {
    ...state,
    refetch,
  };
};
