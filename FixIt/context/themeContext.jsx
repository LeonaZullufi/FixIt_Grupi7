// context/ThemeContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ThemeContext = createContext();

const themes = {
  light: {
    background: "#f2f2f2",
    card: "#f7f7f7",
    text: "#000000",
    textSecondary: "#555555",
    border: "#e6e6e6",
    tabBar: "#023e8a",
    tabActive: "#A4FFFF",
    tabInactive: "white",
  },
  dark: {
    background: "#0d0d0d",
    card: "#1a1a1a",
    text: "#ffffff",
    textSecondary: "#bfbfbf",
    border: "#262626",
    tabBar: "#023e8a",
    tabActive: "#A4FFFF",
    tabInactive: "#cccccc",
  },
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("light");

  const toggleTheme = async (label) => {
    const newTheme = label === "Errët" ? "dark" : "light";
    setTheme(newTheme);
    await AsyncStorage.setItem("appTheme", newTheme);
  };

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem("appTheme");
      if (saved) setTheme(saved);
    })();
  }, []);

  return (
    <ThemeContext.Provider
      value={{ theme, toggleTheme, colors: themes[theme] }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
