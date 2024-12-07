"use client"
import { useState, FormEvent } from 'react'
import Link from "next/link"
import { authClient } from "../../lib/client_auth"
import {useRouter} from "next/navigation"
export default function SignInForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Here you would typically call an API to authenticate the user
    console.log('Signing in with:', { email, password, rememberMe })
    // Simulate API call
  const {data,error} = await authClient.signIn.email({
    email,
    password,
  },
  
  
  {

    onError: (ctx) =>{
      if(ctx.error.status == 403){
        alert("Please verify your email")
      }
    }
  })
  if(error){
    alert("Error: "+error.message)
    setEmail('')
    setPassword('')
    setIsSubmitting(false)
    return;
  }
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSubmitting(false)
    
    // Reset form (in a real app, you'd redirect on successful login)
    setEmail('')
    setPassword('')
    setRememberMe(false)
  }
  
    
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
          <h2 className="text-2xl font-bold mb-1">Sign In</h2>
          <p className="text-gray-500 mb-6">Enter your details to access your account.</p>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                Email
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="email"
                type="email"
                placeholder="your@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                Password
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-gray-800 focus:ring-gray-500 border-gray-300 rounded"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <Link href="/forgot-password" className="text-gray-800 hover:underline">
                  Forgot your password?
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <button
                className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing In...' : 'Sign In'}
              </button>
            </div>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            Don't have an account?{" "}
            <Link href="/sign-up" className="text-gray-800 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

