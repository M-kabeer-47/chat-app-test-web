"use client";
import { useState, FormEvent } from "react";
import Link from "next/link";
import { authClient } from "../../lib/client_auth"
import QRCode from "react-qr-code";
import axios from "axios";
import { useRouter } from "next/navigation";
import { signIn } from '../../lib/google'
import QR from "@/app/components/QR";

export default function SignUpForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrCodeValue, setQrCodeValue] = useState(""); // Store the QR Code value here
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Verify email security via the external API
      // const checkSecurity = await axios.post("http://localhost:3000/api/arcjet", {
      //   email,
      // });
      // if (checkSecurity.status === 200) {
      //   alert("Email is secure");
      // } else {
      //   alert("Email is not secure");
      //   setIsSubmitting(false);
      //   return;
      // }

      // Attempt to sign up
      const { data, error } = await authClient.signUp.email({
        email,
        password,
        name,
      });

      if (error) {
        alert("Signup Error: " + error.message);
        resetForm();
        return;
      }

      // Enable 2FA if signup succeeds
      if (data) {
        
        const twoFactorResponse = await authClient.twoFactor.enable({
          password, 
        });

        alert(JSON.stringify(twoFactorResponse.data));
        if (twoFactorResponse.data?.totpURI) {
          // setQrCodeValue(twoFactorResponse.data.totpURI); // Store QR code value
          // setTwoFactor(true); // Display QR Code section
          alert("2FA setup successful.");
          router.push("/sign-in")
        } else {
          alert("2FA setup failed.");
        }

        setIsSubmitting(false);
      }
    } catch (error) {
      alert("Error: " + (error as any).message);
      resetForm();
    }
  };

  // Reset form fields
  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setIsSubmitting(false);
  };

  return (
    <>
      {twoFactor ? (
        // Render QR code for 2FA setup
        
       <> 
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="w-full max-w-md">
            <div className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
              <h2 className="text-2xl font-bold mb-1">Two Factor Authentication</h2>
              <p className="text-gray-500 mb-6">
                Scan the QR code with your authenticator app to enable two-factor authentication.
              </p>
              <button
                className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
                onClick={() => {setShowQR(true)
                  setTwoFactor(false)
                }}
                
              >
                Generate Qr code
              </button>
            </div>
          </div>
        </div>
       


       </>
      ) 
      :
      (
        // Render signup form
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="w-full max-w-md">
            <div className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
              <h2 className="text-2xl font-bold mb-1">Sign Up</h2>
              <p className="text-gray-500 mb-6">Create your account to get started.</p>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="name"
                  >
                    Name
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="name"
                    type="text"
                    placeholder="cand"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="email"
                  >
                    Email
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="email"
                    type="email"
                    placeholder="cand@mail.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="mb-6">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="password"
                  >
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
                <div className="flex flex-col gap-4">
                  <button
                    className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Signing Up..." : "Sign Up"}
                  </button>
                  <button
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
                    type="button"
                    disabled={isSubmitting}
                    onClick={async () => {
                      await signIn();
                      alert("Signed up with Google");
                    }}
                  >
                    Sign Up with Google
                  </button>
                </div>
              </form>
              <p className="text-center text-sm text-gray-500 mt-4">
                Already have an account?{" "}
                <Link href="/sign-in" className="text-gray-800 hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
