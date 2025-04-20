"use client";

import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../../components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

// Create motion components using the same API as in your register page
const MotionCard = motion(Card);

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  interface FormDataState {
    username: string;
    password: string;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev: FormDataState) => ({
      ...prev,
      [id]: value,
    }));
  };

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  interface LoginError {
    error: string;
    [key: string]: any;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError({});

    try {
      await login(formData.username, formData.password);
      router.push("/"); // Redirect to home page after successful login
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError({ form: err.message });
      } else if (typeof err === "object" && err !== null) {
        // Handle structured errors from the backend
        const errorObj = err as LoginError;
        if (errorObj.error) {
          setError({ form: errorObj.error });
        } else {
          // Handle field-specific errors if they exist
          const newErrors: { [key: string]: string } = {};
          Object.keys(errorObj).forEach((key) => {
            newErrors[key] = Array.isArray(errorObj[key])
              ? errorObj[key][0]
              : String(errorObj[key]);
          });
          setError(
            Object.keys(newErrors).length
              ? newErrors
              : { form: "An error occurred during login" }
          );
        }
      } else {
        setError({ form: "An unexpected error occurred during login" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-4xl"
      >
        <MotionCard
          className="overflow-hidden border-none shadow-lg"
          variants={itemVariants}
        >
          <div className="flex flex-col lg:flex-row">
            <div className="lg:w-1/2 relative h-48 sm:h-64 lg:h-auto">
              <Image
                src="/login.png"
                alt="Login illustration"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>
            <div className="lg:w-1/2 p-6 bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                  Login to StatValue AI
                </CardTitle>
                <CardDescription className="text-center text-gray-700">
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="username" className="text-gray-800">
                      Username
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter your username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                    {error.username && (
                      <p className="text-red-500 text-sm">{error.username}</p>
                    )}
                  </div>
                  <div className="space-y-1 relative">
                    <Label htmlFor="password" className="text-gray-800">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-2 top-8 text-gray-600 hover:text-gray-800 focus:outline-none"
                    >
                      {showPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 
                            9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.965 
                            9.965 0 012.353-3.592M15 12a3 3 0 01-3 3m0 0a3 3 0 01-3-3m3 3L3 3m0 0l18 18"
                          />
                        </svg>
                      )}
                    </button>
                    {error.password && (
                      <p className="text-red-500 text-sm">{error.password}</p>
                    )}
                  </div>
                  {error.form && (
                    <div className="bg-red-50 p-3 rounded-md border border-red-200">
                      <p className="text-red-500 text-sm">{error.form}</p>
                    </div>
                  )}
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Logging in..." : "Login"}
                    </Button>
                  </motion.div>
                </form>
              </CardContent>
              <CardFooter className="flex justify-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link
                    href="/register"
                    className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                  >
                    Register here
                  </Link>
                </p>
              </CardFooter>
            </div>
          </div>
        </MotionCard>
      </motion.div>
    </div>
  );
}
