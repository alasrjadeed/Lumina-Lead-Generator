import { create } from "zustand";
import { persist } from "zustand/middleware";

const themes = {
  corporate: "corporate",
  ocean: "ocean",
  sunset: "sunset",
  forest: "forest",
  midnight: "midnight",
  candy: "candy",
  cyberpunk: "cyberpunk",
  garden: "garden",
  luxury: "luxury",
  coffee: "coffee",
  emerald: "emerald",
  royal: "royal",
  autumn: "autumn",
  spring: "spring",
  arctic: "arctic",
  lavender: "lavender",
  cherry: "cherry",
  neon: "neon",
  pastel: "pastel",
  slate: "slate",
  dracula: "dracula",
  dim: "dim",
  nord: "nord",
  business: "business",
  acid: "acid",
  lemonade: "lemonade",
  wireframe: "wireframe",
  cmyk: "cmyk",
  lofi: "lofi",
  fantasy: "fantasy",
  valentine: "valentine",
  halloween: "halloween",
  light: "light",
  dark: "dark",
  night: "night",
};

const useThemeStore = create(
  persist(
    (set) => ({
      currentTheme: "light",
      themes,

      setTheme: (themeName) => {
        set({ currentTheme: themeName });
        document.documentElement.setAttribute("data-theme", themeName);
      },
    }),
    {
      name: "lmina-theme",
      partialize: (state) => ({
        currentTheme: state.currentTheme,
      }),
    }
  )
);

export default useThemeStore;
