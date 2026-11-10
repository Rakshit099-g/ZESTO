import { createContext, useState, useEffect, type ReactNode, useContext } from "react";
import { authApi, restaurantApi } from "../services/api";
import type { AppContextType, ICart, LocationData, User } from "../types";
import { Toaster } from "react-hot-toast";

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
  const [cart, setCart] = useState<ICart[]>([])
  const [quantity, setQuantity] = useState(0)
  const [subTotal, setSubTotal] = useState(0)

  async function fetchUser() {
    try {
      const response = await authApi.get("/api/auth/me");
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

  async function fetchCart() {
    try {
      const { data } = await restaurantApi.get("/api/cart/all")
      setCart(data.cart || [])
      setQuantity(data.cartLength)
      setSubTotal(data.subTotal)
    } catch (error: any) {
      console.log(error)
    }
  }


  useEffect(() => {
    if (user && user.role === "customer") {
      fetchCart();
    }
  }, [user])

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
    value={{ isAuth, setLoading, setUser, user, loading, LoadingLocation, location, setIsAuth, city,cart,fetchCart,quantity,subTotal }}
  >

    {children}
    <Toaster />
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