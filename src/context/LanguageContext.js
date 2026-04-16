import { createContext, useContext, useState, useCallback } from "react";
import translations from "../config/translations";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try { return localStorage.getItem("wtw-language") || "pl-PL"; } catch { return "pl-PL"; }
  });
  // Region is always PL — UI selector hidden until multi-market expansion
  const [region, setRegionState] = useState("PL");

  function setLanguage(lang) {
    setLanguageState(lang);
    try { localStorage.setItem("wtw-language", lang); } catch {}
  }
  // setRegion preserved for future use — does NOT persist to UI or localStorage
  function setRegion(reg) { // eslint-disable-line no-unused-vars
    setRegionState(reg);
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
