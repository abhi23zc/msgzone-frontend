"use client"
import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  let email;
  let password;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-indigo-950 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center mb-8">
          <div className="h-10 w-10 rounded bg-gradient-to-br from-purple-500 to-blue-400 flex items-center justify-center">
            <div className="h-6 w-6 rounded-sm bg-indigo-900"></div>
          </div>
          <span className="ml-3 text-2xl font-bold text-white">Dashdark X</span>
        </div>
        
        {/* Card */}
        <div className="bg-slate-900/80 backdrop-blur-md rounded-xl shadow-2xl p-8 border border-slate-800">
          <h2 className="text-3xl font-bold text-center text-white mb-8">Login</h2>
          
          {/* Social Login */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button className="flex items-center justify-center py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-white border border-slate-700">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Login with Google
            </button>
            <button className="flex items-center justify-center py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-white border border-slate-700">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.624 12.279c.036 2.782 2.524 3.713 2.545 3.723-.02.065-.385 1.288-1.268 2.549-.777 1.115-1.587 2.229-2.847 2.25-1.243.021-1.646-.724-3.069-.724-1.418 0-1.861.703-3.037.748-1.214.044-2.138-1.204-2.927-2.311-1.595-2.262-2.811-6.389-1.176-9.175.815-1.379 2.267-2.25 3.842-2.271 1.203-.022 2.334.793 3.067.793.738 0 2.118-.979 3.573-.833.608.024 2.311.24 3.404 1.811-.088.055-2.03 1.162-2.007 3.46m-2.345-6.767c.651-.773 1.089-1.845 1.136-2.982-.365.036-1.624.156-2.591 1.051-.559.537-1.053 1.395-1.077 2.487.365.025 1.624-.06 2.532-.556" fill="white"/>
              </svg>
              Login with Apple
            </button>
          </div>
          
          <div className="flex items-center my-6 bg-black">
            <div className="flex-grow h-px bg-slate-700"></div>
            <span className="px-4 text-sm text-slate-400">or Login with</span>
            <div className="flex-grow h-px bg-slate-700"></div>
          </div>
          
          {/* Login Fields */}
          <div className="space-y-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <Mail size={18} />
              </div>
              <input
                type="email"
                id="email"
                className="w-full py-3 pl-10 pr-4 bg-slate-800/60 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-white"
                placeholder="Your Email"
                onChange={(event)=>{
                    email = (event.target.value)
                }}
                required
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <Lock size={18} />
              </div>
              <input
                type="text"
                id="password"
                className="w-full py-3 pl-10 pr-12 bg-slate-800/60 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-white"
                placeholder="Your Password"
                
                onChange={(e)=>{
                    password = (e.target.value)
                }}
                required
                
              />
              
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-white"
              >
                {/* {showPassword ? <EyeOff size={18} /> : <Eye size={18} />} */}
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="w-4 h-4 rounded accent-purple-500 bg-slate-800 border-slate-700 focus:ring-2 focus:ring-purple-500"
                />
                <label htmlFor="remember-me" className="ml-2 text-sm text-slate-300">
                  Remember me
                </label>
              </div>
              <button className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors">
                Forgot password?
              </button>
            </div>
            
            <button
             onClick={(e)=>{
                console.log("Submit")
                console.log(email , password)
             }}
              className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium shadow-lg shadow-purple-600/20 flex items-center justify-center transition-all hover:shadow-purple-600/40"
            >
              <LogIn size={18} className="mr-2" />
              Submit
             
            </button>
            
          </div>
          
          <div className="mt-8 text-center">
            <span className="text-slate-400">Don't have an account?</span>{' '}
            <button className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
              Signup
            </button>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-8 text-center text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} Dashdark X. All rights reserved.
        </div>
      </div>
    </div>
  );
}