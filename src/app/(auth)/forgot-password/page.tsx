"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/app/lib/client_auth"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      const { data, error } = await authClient.forgetPassword({
        email: email,
        redirectTo: "/reset-password",
      })

      if (data) {
        alert("Password reset link sent to your email")
        router.push("/sign-in")
      } else if (error) {
        //@ts-ignore
        setError(error.message)
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
          <h2 className="text-2xl font-bold mb-1">Forgot Password</h2>
          <p className="text-gray-500 mb-6">Enter your email address to reset your password.</p>
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
            {error && (
              <div className="mb-4 text-red-500 text-sm">{error}</div>
            )}
            <div className="flex items-center justify-between">
              <button
                className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Reset Password'}
              </button>
            </div>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            Remember your password?{" "}
            <Link href="/sign-in" className="text-gray-800 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

