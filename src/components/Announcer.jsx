import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

const AnnounceContext = createContext(() => {});

// Polite live region for status messages such as "Added X to cart".
export function AnnouncerProvider({ children }) {
  const [message, setMessage] = useState("");
  const timer = useRef();

  const announce = useCallback((text) => {
    // Clear first so repeating the same message is announced again.
    setMessage("");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(text), 50);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <AnnounceContext.Provider value={announce}>
      {children}
      <div className="visually-hidden" role="status" aria-live="polite">
        {message}
      </div>
    </AnnounceContext.Provider>
  );
}

export const useAnnounce = () => useContext(AnnounceContext);
