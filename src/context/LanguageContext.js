import { createContext, useContext, useState } from "react";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try { return localStorage.getItem("wtw-language") || "pl-PL"; } catch { return "pl-PL"; }
  });
  const [region, setRegionState] = useState(() => {
    try { return localStorage.getItem("wtw-region") || "PL"; } catch { return "PL"; }
  });

  function setLanguage(lang) {
    setLanguageState(lang);
    try { localStorage.setItem("wtw-language", lang); } catch {}
  }
  function setRegion(reg) {
    setRegionState(reg);
    try { localStorage.setItem("wtw-region", reg); } catch {}
  }

  return (
    <LanguageContext.Provider value={{ language, region, setLanguage, setRegion }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
