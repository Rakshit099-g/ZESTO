import { Navigate, Outlet } from "react-router-dom"
import { useAppData } from "../Context/AppContext"
//purpose:logged in user ko login page ko dobara dikhane se rokna
const PublicRoute = ()=>{
    const {isAuth,loading} = useAppData()
    if(loading) return null;
    
    return isAuth? <Navigate to={"/"} replace/>:<Outlet/>


    
}
export default PublicRoute