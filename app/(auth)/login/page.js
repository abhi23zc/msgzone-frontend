"use client";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Mail, Lock, LogIn } from "lucide-react";
import Link from "next/link";
import { useFetch } from "@/hooks/useFetch";
import Loading from "@/components/Loading";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import useLocalStorage from "@/hooks/useLocalstorage";
import toast from "react-hot-toast";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userData, setuserData] = useLocalStorage("user", null)

  const router = useRouter()

  const URL = process.env.NEXT_PUBLIC_API_URL + "/api/v1/auth/login";

  const { user, setUser } = useAuth();

  const [data, loading, error, triggerFetch] = useFetch(URL, {
    method: "POST",
    body: { email, password },
  });


  useEffect(() => {
    // console.log(user)
    if (data?.success) {
      setUser(data?.data.user)
      document.cookie = `token=${data?.data.token}; path=/;`;
      setuserData(data?.data?.user)
    }
    if(error){
      toast.error(error)
    }
  }, [data, user, error])

  useEffect(() => {
    if (user) {
      router.replace("/dashboard")
      return;
    }
  }, [user])


  const handleSubmit = (e) => {
    e.preventDefault();
    triggerFetch();

    console.log(data)
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-indigo-950 p-2 sm:p-4">
      <div className="w-full max-w-4xl flex flex-col md:flex-row bg-transparent md:bg-slate-900/60 md:rounded-2xl md:shadow-2xl overflow-hidden">
        {/* Side Illustration/Brand */}
        <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-purple-700/80 to-indigo-900/80 p-8 w-1/2">
          <div className="flex flex-col items-center">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-400 flex items-center justify-center mb-4 shadow-lg">
              <div className="h-8 w-8 rounded bg-indigo-900"></div>
            </div>
            <span className="text-3xl font-bold text-white mb-2">Msgzone</span>
            <p className="text-slate-200 text-center max-w-xs">
              Welcome back! Sign in to access your dashboard and manage your account.
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="w-full md:w-1/2 bg-slate-900/90 backdrop-blur-md rounded-xl md:rounded-none md:rounded-r-2xl shadow-2xl p-4 sm:p-8 border border-slate-800 flex flex-col justify-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-white mb-6 sm:mb-8">
            Login
          </h2>

          {/* Social Login */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <button className="flex items-center justify-center py-2 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span className="text-sm font-medium">Google</span>
            </button>
            <button className="flex items-center justify-center py-2 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.624 12.279c.036 2.782 2.524 3.713 2.545 3.723-.02.065-.385 1.288-1.268 2.549-.777 1.115-1.587 2.229-2.847 2.25-1.243.021-1.646-.724-3.069-.724-1.418 0-1.861.703-3.037.748-1.214.044-2.138-1.204-2.927-2.311-1.595-2.262-2.811-6.389-1.176-9.175.815-1.379 2.267-2.25 3.842-2.271 1.203-.022 2.334.793 3.067.793.738 0 2.118-.979 3.573-.833.608.024 2.311.24 3.404 1.811-.088.055-2.03 1.162-2.007 3.46m-2.345-6.767c.651-.773 1.089-1.845 1.136-2.982-.365.036-1.624.156-2.591 1.051-.559.537-1.053 1.395-1.077 2.487.365.025 1.624-.06 2.532-.556" fill="white" />
              </svg>
              <span className="text-sm font-medium">Apple</span>
            </button>
          </div>

          <div className="flex items-center my-4 sm:my-6">
            <div className="flex-grow h-px bg-slate-700"></div>
            <span className="px-3 sm:px-4 text-xs sm:text-sm text-slate-400">or login with email</span>
            <div className="flex-grow h-px bg-slate-700"></div>
          </div>

          {/* Login Fields */}
          <form
            className="space-y-5 sm:space-y-6"
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <Mail size={18} />
              </div>
              <input
                type="email"
                id="email"
                className="w-full py-3 pl-10 pr-4 bg-slate-800/60 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-white placeholder-slate-400 text-sm sm:text-base"
                placeholder="Your Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="w-full py-3 pl-10 pr-12 bg-slate-800/60 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-white placeholder-slate-400 text-sm sm:text-base"
                placeholder="Your Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-white"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">

              <button
                type="button"
                className="text-xs sm:text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
              >
                Forgot password?
              </button>
            </div>
            <div onClick={handleSubmit} className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium shadow-lg shadow-purple-600/20 transition-all flex items-center justify-center  hover:shadow-purple-600/40 focus:outline-none focus:ring-2 focus:ring-purple-500">
              {
                loading ? <Loading className={"border-white"} /> :
                  <button

                    type="submit"
                    className="flex items-center justify-center "
                  >
                    <LogIn size={18} className="mr-2" />
                    <span className="text-sm sm:text-base">Sign In</span>
                  </button>
              }
            </div>


          </form>

          <div className="mt-6 sm:mt-8 text-center">
            <span className="text-slate-400 text-sm">Don&apos;t have an account?</span>{" "}
            <Link
              href={"/register"}
              className="text-purple-400 hover:text-purple-300 font-medium transition-colors cursor-pointer text-sm"
            >
              Signup
            </Link>
          </div>
        </div>
      </div>
      {/* Footer */}
      <div className="w-full text-center text-slate-500 text-xs sm:text-sm mt-8 absolute bottom-2 left-0">
        &copy; {new Date().getFullYear()} Msgzone. All rights reserved.
      </div>
    </div>
  );
}