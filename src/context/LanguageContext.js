import { createContext, useContext, useState, useCallback } from "react";
import translations from "../config/translations";

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

  const t = useCallback((key, vars = {}) => {
    const lang = language.slice(0, 2);
    const dict = translations[lang] || translations.en;
    let str = dict[key] ?? translations.en[key] ?? key;
    Object.entries(vars).forEach(([k, v]) => {
      str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    });
    return str;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, region, setLanguage, setRegion, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
