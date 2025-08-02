"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  const validateEmail = (email: string) => {
    if (!email) {
      return "Email is required.";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Invalid email format.";
    }
    return null;
  };

  const validatePassword = (password: string) => {
    if (!password) {
      return "Password is required.";
    }
    if (password.length < 8) {
      return "Password must be at least 8 characters.";
    }
    return null;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setEmailError(validateEmail(newEmail));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordError(validatePassword(newPassword));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);

    const finalEmailError = validateEmail(email);
    const finalPasswordError = validatePassword(password);

    if (finalEmailError || finalPasswordError) {
      setEmailError(finalEmailError);
      setPasswordError(finalPasswordError);
      setGlobalError("Please correct the errors above.");
      return;
    }

    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setGlobalError("Invalid email or password.");
    } else {
      router.push(callbackUrl);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-gray-700 text-2xl font-bold mb-6 text-center">Login</h1>
        {globalError && <p className="text-red-500 text-sm mb-4 text-center">{globalError}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              className={`shadow appearance-none border ${emailError ? 'border-red-500' : 'border-gray-300'} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
              value={email}
              onChange={handleEmailChange}
              onBlur={() => setEmailError(validateEmail(email))}
              required
            />
            {emailError && <p className="text-red-500 text-xs italic mt-1">{emailError}</p>}
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              className={`shadow appearance-none border ${passwordError ? 'border-red-500' : 'border-gray-300'} rounded w-full py-2 px-3 text-gray-700 mb-1 leading-tight focus:outline-none focus:shadow-outline`}
              value={password}
              onChange={handlePasswordChange}
              onBlur={() => setPasswordError(validatePassword(password))}
              required
            />
            {passwordError && <p className="text-red-500 text-xs italic mt-1">{passwordError}</p>}
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            >
              Sign In
            </button>
          </div>
        </form>
        <div className="mt-6 text-center text-sm text-gray-600 border-t pt-4">
          <p className="font-semibold mb-2">Akun :</p>
          <p>
            Seller Credentials: <br/>
            Email: <span className="font-medium text-blue-700">seller@example.com</span> <br/>
            Password: <span className="font-medium text-blue-700">sellerpassword</span>
          </p>
          <p className="mt-2">
            Buyer Credentials: <br/>
            Email: <span className="font-medium text-green-700">buyer@example.com</span> <br/>
            Password: <span className="font-medium text-green-700">buyerpassword</span>
          </p>
          <p className="mt-2">
            Admin Credentials: <br/>
            Email: <span className="font-medium text-red-700">admin@example.com</span> <br/>
            Password: <span className="font-medium text-red-700">adminpassword</span>
          </p>
          <p className="mt-4">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="text-blue-500 hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInForm />
    </Suspense>
  );
}