import { createContext, useState, useEffect, type ReactNode, useContext } from "react";
import api from "../services/api";
import type { AppContextType, LocationData, User } from "../types";

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
    children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuth, setIsAuth] = useState(false);
    const [loading, setLoading] = useState(true);
    const [location, setLocation] = useState<LocationData | null>(null);
    const [LoadingLocation, setLoadingLocation] = useState(false);
    const [city, setCity] = useState("Fetching Location...");

    async function fetchUser() {
        try {
            const response = await api.get("/api/auth/me");
            setUser(response.data);
            setIsAuth(true);
        } catch (error) {
            console.log(error);
            setUser(null);
            setIsAuth(false);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchUser();
    }, []);

    //browser se coordinates → API se shehar ka naam → state mein save, taaki poori app mein navbar ya home page pe dikha sako.
    // useEffect(() => {
    //     if (!navigator.geolocation) {
    //         return alert('Please Allow Location to continue')
    //     }
    //     setLoadingLocation(true)
    //     navigator.geolocation.getCurrentPosition(async (position) => {
    //         const { latitude, longitude } = position.coords
    //         try {
    //             const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
    //             const data = await res.json()
    //             setLocation({
    //                 latitude,
    //                 longitude,
    //                 formattedAddress: data.display_name || "current location",
    //             })
    //             setCity(data.address.city || data.address.town || data.address.village || "Your location")
    //             setLoadingLocation(false)
    //         } catch (error) {
    //             setLocation({
    //                 latitude,
    //                 longitude,
    //                 formattedAddress: "current location",
    //             });
    //             setCity("Failed to load");
    //             setLoadingLocation(false);
    //         }
    //     })
    // }, [])
    useEffect(() => {
  if (!navigator.geolocation) {
    setCity("Location not supported");
    return;
  }
  setLoadingLocation(true);

  navigator.geolocation.getCurrentPosition(
    async ({ coords }) => {
      const { latitude, longitude } = coords;
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
        if (!res.ok) throw new Error("Reverse geocoding failed");
        const data = await res.json();
        const a = data.address ?? {};

        setLocation({
          latitude,
          longitude,
          formattedAddress: data.display_name || "current location",
        });
        setCity(
          a.city || a.town || a.village || a.suburb || a.state_district || "Your location"
        );
      } catch {
        setLocation({ latitude, longitude, formattedAddress: "current location" });
        setCity("Failed to load");
      } finally {
        setLoadingLocation(false);
      }
    },
    (err) => {
      setCity(err.code === err.PERMISSION_DENIED ? "Location blocked" : "Location unavailable");
      setLoadingLocation(false);
    },
    { timeout: 10000 }
  );
}, []);
    return (
        <AppContext.Provider
            value={{ isAuth, setLoading, setUser, user, loading, setIsAuth,city }}
        >
            {children}
        </AppContext.Provider>
    );
};

export const useAppData = (): AppContextType => {
    const context = useContext(AppContext)
    if (!context) {
        throw new Error("useAppData must be used within AppProvider")
    }
    return context
}