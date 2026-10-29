import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";

import { FcGoogle } from "react-icons/fc";
import api from "../services/api";
import { useAppData } from "../Context/AppContext";
const Login = () => {
    const [loading, setLoading] = useState(false);
    const { setUser, setIsAuth } = useAppData();
    const navigate = useNavigate()
    const responseGoogle = async (authResult: any) => {
        setLoading(true)
        try {
            const result = await api.post(
                "/api/auth/login",
                {
                    code: authResult.code,
                });
            toast.success(result.data.message)
            setUser(result.data.user); 
            setIsAuth(true);
            setLoading(false)
            navigate("/")
        } catch (error) {
            console.log(error)
            toast.error("Problem while login")
            setLoading(false)
        }
    }
    const googleLogin = useGoogleLogin({
        onSuccess: responseGoogle,
        onError: responseGoogle,
        flow: "auth-code"
    })
    return (
        <div className="flex min-h-screen items-center justify-center bg-white px-4">
            <div className="w-full max-w-sm space-y-6">
                <h1 className="text-center text-3xl font-bold text-[#E23774]">
                    Zesto
                </h1>

                <p className="text-center text-sm text-gray-500">
                    Log in or sign up to continue
                </p>

                <button
                    onClick={googleLogin}
                    style={{cursor: 'pointer'}}
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-3"
                >
                    <FcGoogle size={22} />
                    <span>
                        {loading ? "Please wait..." : "Continue with Google"}
                    </span>
                </button>
            </div>
        </div>
    )
}

export default Login