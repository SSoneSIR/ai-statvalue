"use client";

import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

// Create motion components using the newer API
const MotionCard = motion(Card);

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [error, setError] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmShowPassword, setConfirmShowPassword] = useState(false);
  const router = useRouter();
  const { register } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const fieldName = id === "confirm-password" ? "confirm_password" : id;

    setFormData({
      ...formData,
      [fieldName]: value,
    });

    // Clear error for the field being changed
    if (error[fieldName]) {
      const updatedErrors = { ...error };
      delete updatedErrors[fieldName];
      setError(updatedErrors);
    }
  };

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
  const toggleConfirmPasswordVisibility = () =>
    setConfirmShowPassword((prev) => !prev);

  const validateForm = (): { [key: string]: string } => {
    const errors: { [key: string]: string } = {};
    const { username, email, password, confirm_password } = formData;

    if (!username) errors.username = "Username is required";
    if (!email) errors.email = "Email is required";
    if (!password) errors.password = "Password is required";
    if (password !== confirm_password)
      errors.confirm_password = "Passwords do not match";

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (password && !passwordRegex.test(password)) {
      errors.password =
        "Password must be at least 8 characters, include an uppercase letter, a number, and a special character";
    }

    return errors;
  };

  // Custom function to parse and extract specific field errors from response
  const parseApiErrors = (responseData: any): { [key: string]: string } => {
    const errors: { [key: string]: string } = {};

    // Handle case where response is an object with field-specific errors
    if (responseData && typeof responseData === "object") {
      // Check for common API error formats
      if (responseData.errors && typeof responseData.errors === "object") {
        return responseData.errors;
      }

      // Check if the response directly contains field errors
      for (const field of [
        "username",
        "email",
        "password",
        "confirm_password",
        "non_field_errors",
      ]) {
        if (responseData[field]) {
          // Handle both array and string formats
          if (Array.isArray(responseData[field])) {
            errors[field === "non_field_errors" ? "form" : field] =
              responseData[field][0];
          } else if (typeof responseData[field] === "string") {
            errors[field === "non_field_errors" ? "form" : field] =
              responseData[field];
          }
        }
      }

      // If we found specific errors, return them
      if (Object.keys(errors).length > 0) {
        return errors;
      }

      // Check for a detail field (common in DRF)
      if (responseData.detail) {
        return { form: responseData.detail };
      }
    }

    // Handle string message or fallback
    if (typeof responseData === "string") {
      // Try to determine if this is an email or username error
      const lowerCaseError = responseData.toLowerCase();
      if (
        lowerCaseError.includes("email") &&
        (lowerCaseError.includes("already") ||
          lowerCaseError.includes("exists"))
      ) {
        return {
          email:
            "This email is already registered. Please use a different email or try logging in.",
        };
      } else if (
        lowerCaseError.includes("username") &&
        (lowerCaseError.includes("already") ||
          lowerCaseError.includes("exists"))
      ) {
        return {
          username:
            "This username is already taken. Please choose a different username.",
        };
      }
      return { form: responseData };
    }

    // Default fallback
    return {
      form: "Registration failed. Please check your information and try again.",
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setError(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setError({});

    try {
      const { username, email, password, confirm_password } = formData;

      // Attempt to register and get the response
      await register(username, email, password, confirm_password);

      // If we get here, registration was successful
      // The register function should handle any redirection needed
    } catch (err: any) {
      console.error("Registration error:", err);

      // Try to extract response data
      let responseData = null;

      if (err.response) {
        // If the error has a response property (common in axios/fetch errors)
        try {
          // The error might already have parsed data
          responseData = err.response.data;
        } catch (parseError) {
          console.error("Error parsing response data:", parseError);
        }
      }

      // Parse the error and set appropriate error messages
      const parsedErrors = parseApiErrors(responseData || err);
      setError(parsedErrors);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormInvalid = Object.keys(validateForm()).length > 0;

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

  const formFields = [
    {
      id: "username",
      label: "Username",
      type: "text",
      value: formData.username,
    },
    {
      id: "email",
      label: "Email",
      type: "email",
      value: formData.email,
    },
    {
      id: "password",
      label: "Password",
      type: "password",
      value: formData.password,
      description:
        "Password must have at least 8 characters including an uppercase letter, a number, and a special character",
    },
    {
      id: "confirm-password",
      label: "Confirm Password",
      type: "password",
      value: formData.confirm_password,
      description: "Please retype your password to confirm",
    },
  ];

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
                src="/register.png"
                alt="Register illustration"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>
            <div className="lg:w-1/2 p-6 bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                  Register for StatValue AI
                </CardTitle>
                <CardDescription className="text-center text-gray-700">
                  Create your account to get started
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {formFields.map((field) => {
                    const fieldName =
                      field.id === "confirm-password"
                        ? "confirm_password"
                        : field.id;
                    const hasError = !!error[fieldName];

                    return (
                      <div key={field.id} className="space-y-1 relative">
                        <Label htmlFor={field.id} className="text-gray-800">
                          {field.label}
                        </Label>
                        <Input
                          id={field.id}
                          type={
                            field.id === "password"
                              ? showPassword
                                ? "text"
                                : "password"
                              : field.id === "confirm-password"
                              ? confirmShowPassword
                                ? "text"
                                : "password"
                              : field.type
                          }
                          placeholder={`Enter your ${field.label.toLowerCase()}`}
                          value={field.value}
                          onChange={handleChange}
                          required
                          className={`text-black border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-10 ${
                            hasError
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                              : ""
                          }`}
                          aria-invalid={hasError}
                          aria-describedby={
                            hasError ? `${field.id}-error` : undefined
                          }
                        />
                        {(field.id === "password" ||
                          field.id === "confirm-password") && (
                          <button
                            type="button"
                            onClick={
                              field.id === "password"
                                ? togglePasswordVisibility
                                : toggleConfirmPasswordVisibility
                            }
                            className="absolute right-2 top-8 text-gray-600 hover:text-gray-800 focus:outline-none"
                            aria-label={
                              field.id === "password"
                                ? showPassword
                                  ? "Hide password"
                                  : "Show password"
                                : confirmShowPassword
                                ? "Hide confirm password"
                                : "Show confirm password"
                            }
                          >
                            {(field.id === "password" && showPassword) ||
                            (field.id === "confirm-password" &&
                              confirmShowPassword) ? (
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
                        )}
                        {field.description && (
                          <p className="text-xs text-gray-500 mt-1">
                            {field.description}
                          </p>
                        )}
                        {hasError && (
                          <p
                            id={`${field.id}-error`}
                            className="text-red-500 text-sm mt-1"
                          >
                            {error[fieldName]}
                          </p>
                        )}
                      </div>
                    );
                  })}

                  {error.form && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-red-600 text-sm">{error.form}</p>
                    </div>
                  )}

                  <motion.div
                    whileHover={{
                      scale: isSubmitting || isFormInvalid ? 1 : 1.03,
                    }}
                    whileTap={{
                      scale: isSubmitting || isFormInvalid ? 1 : 0.98,
                    }}
                  >
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
                      disabled={isSubmitting || isFormInvalid}
                    >
                      {isSubmitting ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Registering...
                        </>
                      ) : (
                        "Register"
                      )}
                    </Button>
                  </motion.div>
                </form>
              </CardContent>
              <CardFooter className="flex justify-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                  >
                    Login here
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
