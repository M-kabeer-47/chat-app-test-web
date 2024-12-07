"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/app/lib/client_auth"
import Link from "next/link"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleResetPassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    if (password !== confirmPassword) {
      setError("Passwords don't match")
      setIsSubmitting(false)
      return
    }

    try {
      const { data, error } = await authClient.resetPassword({
        newPassword: password,
      })

      if (data) {
        alert("Password reset successfully")
        router.push("/sign-in")
      } else if (error) {
        //@ts-ignore
        setError(error?.message)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
          <h2 className="text-2xl font-bold mb-1">Reset Password</h2>
          <p className="text-gray-500 mb-6">Enter your new password below.</p>
          <form onSubmit={handleResetPassword}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                New Password
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirm-password">
                Confirm New Password
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                {isSubmitting ? 'Resetting...' : 'Reset Password'}
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

