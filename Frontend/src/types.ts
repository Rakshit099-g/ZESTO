import type { Dispatch, SetStateAction } from "react"

export interface User {
    _id: string,
    name: string,
    email: string,
    image: string,
    role: string
}

export interface LocationData {
    latitude: number,
    longitude: number,
    formattedAddress: string,
}

export interface AppContextType {
    user: User | null;
    loading: boolean;
    isAuth: boolean;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    location: LocationData | null;
    LoadingLocation: boolean;
    city: string;
    cart: ICart[] | [];
    fetchCart: () => Promise<void>;
    subTotal: number;
    quantity: number;

}

export interface IRestaurant {
    _id: string;
    name: string;
    description?: string;
    image: string;
    ownerId: string;
    phone: number;
    isVerified: boolean;
    autoLocation: {
        type: "Point",
        coordinates: [number, number];
        formattedAddress: string;
    }
    isOpen: boolean;
    createdAt: Date;
    distance?: number;
    distanceKm?: number;
}

export interface IMenuItems {
    _id: string,
    restaurantId: string;
    name: string;
    description?: string;
    image: string;
    price: number;
    isAvailable: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface ICart extends Document {
    userId: string;
    restaurantId: string | IRestaurant;
    itemId: string | IMenuItems;
    quantity: number;
    createdAt: Date;
    updatedAt: Date;
}