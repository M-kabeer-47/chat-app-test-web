"use client"

import { useState, useEffect, useRef, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '../../lib/client_auth'

export default function TwoFactor() {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isOtpSubmitting, setIsOtpSubmitting] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const router = useRouter()

  useEffect(() => {
    authClient.twoFactor.sendOtp()
  }, [])

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Move to next input
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && index > 0 && otp[index] === '') {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsOtpSubmitting(true)
    const otpString = otp.join('')

    try {
      const { data, error } = await authClient.twoFactor.verifyOtp({
        code: otpString
      })

      if (data) {
        alert("You have been signed in")
        router.push("/dashboard")
      } else if (error) {
        alert("Error: " + JSON.stringify(error))
        setOtp(['', '', '', '', '', ''])
      }
    } catch (error) {
      alert("An unexpected error occurred")
    } finally {
      setIsOtpSubmitting(false)
    }
  }

  const resendOtp = async () => {
    try {
      const { data, error } = await authClient.twoFactor.sendOtp()
      if (data) {
        alert("OTP sent successfully")
      } else if (error) {
        alert("Error: " + JSON.stringify(error))
      }
    } catch (error) {
      alert("An unexpected error occurred while resending OTP")
    }
    setOtp(['', '', '', '', '', ''])
    setIsOtpSubmitting(false)
    inputRefs.current[0]?.focus()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
          <h2 className="text-2xl font-bold mb-1">Verify with OTP</h2>
          <p className="text-gray-500 mb-6">Enter the 6-digit code sent to your device.</p>
          <form onSubmit={handleSubmit}>
            <div className="mb-6 flex justify-between">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  //@ts-ignore
                  ref={(el) => (inputRefs.current[index] = el)}
                  className="shadow appearance-none border rounded w-12 h-12 text-center text-gray-700 text-2xl leading-tight focus:outline-none focus:shadow-outline"
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  required
                />
              ))}
            </div>
            <div className="flex items-center justify-between">
              <button
                className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
                type="submit"
                disabled={isOtpSubmitting}
              >
                {isOtpSubmitting ? 'Verifying...' : 'Verify'}
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-4 text-center">
              Didn't receive the code?{' '}
              <button
                type="button"
                onClick={resendOtp}
                className="text-blue-500 hover:text-blue-700 focus:outline-none"
              >
                Resend
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

