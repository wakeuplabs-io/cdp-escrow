import { useCallback, useState } from "react";

export const useCopyToClipboard = () => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  }, []);

  return { copied, copyToClipboard };
};
