import { BrowserRouter, Route, Routes } from "react-router-dom"
import Home from "./pages/Home"
import Login from "./pages/Login"
import PublicRoute from "./components/PublicRoutes"
import ProtectedRoute from "./components/ProtectedRoute"
import { Toaster } from "react-hot-toast"
import SelectRole from "./pages/SelectRole"
import Navbar from "./components/Navbar"
import Account from "./pages/Account"
import { useAppData } from "./Context/AppContext"
import Restaurant from "./pages/Restaurant"
import RestaurantPage from "./pages/RestaurantPage"
import Cart from "./pages/Cart"
import AddressPage from "./pages/AddressPage"
import Checkout from "./pages/Checkout"

function App() {
    const {user} = useAppData()
    if(user && user.role==="seller") return <Restaurant/>
    return (

        <BrowserRouter>
            <Navbar/>
            <Routes>
                <Route element={<PublicRoute />}>
                    <Route path="/login" element={<Login />} />
                </Route>
                <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/address" element={<AddressPage/>} />
                    <Route path="/checkout" element={<Checkout/>} />
                    <Route path="/restaurant/:id" element={<RestaurantPage />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/select-role" element={<SelectRole />} />
                    <Route path="/account" element={<Account/>} />

                </Route>
            </Routes>
            
        </BrowserRouter>
    )
}

export default App
