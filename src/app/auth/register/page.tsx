// src/app/auth/register/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Role } from "@prisma/client"; // Impor Role enum

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>('BUYER'); // State untuk role
  const [storeName, setStoreName] = useState(""); // State untuk nama toko
  const [isLoading, setIsLoading] = useState(false);

  const [globalMessage, setGlobalMessage] = useState<string | null>(null);
  const [isSuccessMessage, setIsSuccessMessage] = useState(false);

  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [storeNameError, setStoreNameError] = useState<string | null>(null);

  const router = useRouter();

  // Fungsi validasi (tetap sama, ditambah validasi nama toko)
  const validateName = (name: string) => !name.trim() ? "Name is required." : null;
  const validateEmail = (email: string) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "Invalid email format." : null;
  const validatePassword = (password: string) => password.length < 8 ? "Password must be at least 8 characters." : null;
  const validateStoreName = (name: string) => (role === 'SELLER' && !name.trim()) ? "Store name is required." : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalMessage(null);
    setIsLoading(true);

    // Validasi akhir sebelum submit
    const finalNameError = validateName(name);
    const finalEmailError = validateEmail(email);
    const finalPasswordError = validatePassword(password);
    const finalStoreNameError = validateStoreName(storeName);

    if (finalNameError || finalEmailError || finalPasswordError || finalStoreNameError) {
      setNameError(finalNameError);
      setEmailError(finalEmailError);
      setPasswordError(finalPasswordError);
      setStoreNameError(finalStoreNameError);
      setGlobalMessage("Please correct the errors above.");
      setIsSuccessMessage(false);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, storeName }),
      });

      if (res.ok) {
        setGlobalMessage("Registration successful! Redirecting to login page...");
        setIsSuccessMessage(true);
        setTimeout(() => router.push("/auth/signin"), 2000);
      } else {
        const errorData = await res.json();
        setGlobalMessage(errorData.message || "Registration failed.");
        setIsSuccessMessage(false);
      }
    } catch (error) {
      setGlobalMessage(`An unexpected error occurred, ${error}.`);
      setIsSuccessMessage(false);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-6">Register</h2>
        {globalMessage && (
          <div className={`p-3 rounded-md mb-4 text-center ${isSuccessMessage ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {globalMessage}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="label-style">Name</label>
            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} onBlur={() => setNameError(validateName(name))} required className={`input-style ${nameError && 'border-red-500'}`} />
            {nameError && <p className="error-style">{nameError}</p>}
          </div>
          <div>
            <label htmlFor="email" className="label-style">Email address</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => setEmailError(validateEmail(email))} required className={`input-style ${emailError && 'border-red-500'}`} />
            {emailError && <p className="error-style">{emailError}</p>}
          </div>
          <div>
            <label htmlFor="password" className="label-style">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} onBlur={() => setPasswordError(validatePassword(password))} required className={`input-style ${passwordError && 'border-red-500'}`} />
            {passwordError && <p className="error-style">{passwordError}</p>}
          </div>

          <div>
             <label className="label-style">Register as</label>
             <div className="flex items-center space-x-4 mt-1">
               <label className="flex items-center cursor-pointer">
                 <input type="radio" name="role" value="BUYER" checked={role === 'BUYER'} onChange={() => setRole('BUYER')} className="mr-2" />
                 Buyer
               </label>
               <label className="flex items-center cursor-pointer">
                 <input type="radio" name="role" value="SELLER" checked={role === 'SELLER'} onChange={() => setRole('SELLER')} className="mr-2" />
                 Seller
               </label>
             </div>
          </div>
          
          {role === 'SELLER' && (
            <div className="transition-all duration-300">
              <label htmlFor="storeName" className="label-style">Store Name</label>
              <input id="storeName" type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)} onBlur={() => setStoreNameError(validateStoreName(storeName))} required={role === 'SELLER'} className={`input-style ${storeNameError && 'border-red-500'}`} />
              {storeNameError && <p className="error-style">{storeNameError}</p>}
            </div>
          )}

          <div>
            <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400">
              {isLoading ? 'Processing...' : 'Register'}
            </button>
          </div>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/auth/signin" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </p>
      </div>
      <style jsx>{`
        .label-style { display: block; font-size: 0.875rem; font-weight: 500; color: #4a5568; }
        .input-style { margin-top: 0.25rem; display: block; width: 100%; padding: 0.5rem 0.75rem; border-width: 1px; border-color: #d1d5db; border-radius: 0.375rem; }
        .error-style { color: #ef4444; font-size: 0.75rem; font-style: italic; margin-top: 0.25rem; }
      `}</style>
    </div>
  );
}