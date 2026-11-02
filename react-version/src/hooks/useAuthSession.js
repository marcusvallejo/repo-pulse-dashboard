import { useEffect, useRef, useState } from "react";

function useAuthSession() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const generation = useRef(0);
  const signingOut = useRef(false);

  useEffect(function () {
    let disposed = false;
    let controller;
    let expiryTimer;

    function clearLogin() {
      generation.current += 1;
      clearTimeout(expiryTimer);
      if (!disposed) {
        setUser(null);
        setIsLoading(false);
      }
    }

    async function checkSession() {
      if (signingOut.current) return;
      controller?.abort();
      controller = new AbortController();
      const currentGeneration = ++generation.current;
      try {
        const response = await fetch("/api/auth/session", { signal: controller.signal });
        if (!response.ok) throw new Error("Could not check your login. Reload to try again.");
        const data = await response.json();
        if (disposed || currentGeneration !== generation.current) return;
        setUser(data.authenticated ? data.user : null);
        setErrorMessage("");
        clearTimeout(expiryTimer);
        if (data.authenticated && data.expiresAt) {
          expiryTimer = setTimeout(clearLogin, Math.max(0, data.expiresAt - Date.now()));
        }
      } catch (error) {
        if (disposed || error.name === "AbortError" || currentGeneration !== generation.current) return;
        setUser(null);
        setErrorMessage(error.message);
      } finally {
        if (!disposed && currentGeneration === generation.current) setIsLoading(false);
      }
    }

    checkSession();
    window.addEventListener("focus", checkSession);
    window.addEventListener("repopulse:unauthorized", clearLogin);
    return function () {
      disposed = true;
      controller?.abort();
      clearTimeout(expiryTimer);
      window.removeEventListener("focus", checkSession);
      window.removeEventListener("repopulse:unauthorized", clearLogin);
    };
  }, []);

  async function signOut() {
    if (signingOut.current) return;
    signingOut.current = true;
    generation.current += 1;
    setIsSigningOut(true);
    setErrorMessage("");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("Could not sign out. Please try again.");
      generation.current += 1;
      setUser(null);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      signingOut.current = false;
      setIsSigningOut(false);
    }
  }

  return { user, isLoading, isSigningOut, errorMessage, signOut };
}

export default useAuthSession;
