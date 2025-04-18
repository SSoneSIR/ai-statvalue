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
  const router = useRouter();
  const { register } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id === "confirm-password" ? "confirm_password" : id]: value,
    });
  };

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
      await register(username, email, password, confirm_password);
    } catch (err: any) {
      if (err.errors) {
        setError(err.errors);
      } else {
        setError({ form: err.message || "Something went wrong!" });
      }
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
    },
    {
      id: "confirm-password",
      label: "Confirm Password",
      type: "password",
      value: formData.confirm_password,
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
                  {formFields.map((field) => (
                    <div key={field.id} className="space-y-2">
                      <Label htmlFor={field.id} className="text-gray-800">
                        {field.label}
                      </Label>
                      <Input
                        id={field.id}
                        type={field.type}
                        placeholder={`Enter your ${field.label.toLowerCase()}`}
                        value={field.value}
                        onChange={handleChange}
                        required
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                      {error[field.id.replace("-", "_")] && (
                        <p className="text-red-500">
                          {error[field.id.replace("-", "_")]}
                        </p>
                      )}
                    </div>
                  ))}
                  {error.form && <p className="text-red-500">{error.form}</p>}
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
                      disabled={isSubmitting || isFormInvalid}
                    >
                      {isSubmitting ? "Registering..." : "Register"}
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
