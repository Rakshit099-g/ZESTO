import type { Dispatch, SetStateAction } from "react"

export interface User{
    _id:string,
    name:string,
    email:string,
    image:string,
    role:string
}

export interface LocationData {
    latitude:number,
    longitude:number,
    formattedAddress:string,
}

export interface AppContextType{
    user:User | null,
    loading:boolean,
    location:string | null,
    LoadingLocation:boolean,
    isAuth:boolean,
    setUser:Dispatch<SetStateAction<User | null>>
    setLoading:Dispatch<SetStateAction<boolean>>
    setIsAuth:Dispatch<SetStateAction<boolean>>
    city:string

}

export interface IRestaurant {
    _id:string;
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
}

export interface IMenuItems{
    _id:string,
    restaurantId:string;
    name:string;
    description ?: string;
    image : string;
    price : number;
    isAvailable:boolean;
    createdAt : Date;
    updatedAt : Date;
}