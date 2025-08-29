import { useEffect, useRef } from "react";

export function useInfiniteScroll<T extends HTMLElement>(
  fetchNextPage: () => void,
  hasNextPage: boolean
) {
  const loadMoreRef = useRef<T | null>(null);

  useEffect(() => {
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage]);

  return loadMoreRef;
}
