"use client";

import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import emailjs from "emailjs-com";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Mail,
  MessageSquare,
  Phone,
  CheckCircle,
  AlertCircle,
  Lock,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function ContactPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Set the user data when available
  useEffect(() => {
    if (user?.username) {
      setFormData((prev) => ({
        ...prev,
        name: user.username,
      }));
    }
    if (user?.email) {
      setFormData((prev) => ({
        ...prev,
        email: user.email,
      }));
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setErrorMessage("Name is required");
      return false;
    }

    if (!formData.email.trim()) {
      setErrorMessage("Email is required");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMessage("Please enter a valid email address");
      return false;
    }

    if (!formData.message.trim()) {
      setErrorMessage("Message is required");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    setErrorMessage("");

    if (!validateForm()) {
      setSubmitStatus("error");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await emailjs.send(
        "service_f81jbxg",
        "template_mr0z9pm",
        {
          from_name: formData.name,
          reply_to: formData.email,
          message: formData.message,
          to_email: "yashaswanyashu@gmail.com",
        },
        "6-EdD1zlRqZuxZjnW"
      );

      console.log("Email sent:", result.text);
      setSubmitStatus("success");

      setFormData({
        name: user?.username || "",
        email: user?.email || "",
        message: "",
      });
    } catch (error) {
      console.error("EmailJS error:", error);
      setErrorMessage("Failed to send message. Please try again later.");
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="flex flex-col items-center gap-8 text-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Contact Us
          </h1>
          <p className="text-gray-600 mt-2">Get in touch with our team</p>
        </div>
        <div className="grid gap-6 w-full md:grid-cols-2">
          <Card className="border-blue-100 shadow-sm hover:shadow-md transition-shadow bg-white">
            <CardHeader>
              <CardTitle className="text-gray-800">Send us a Message</CardTitle>
              <CardDescription className="text-gray-600">
                {isAuthenticated
                  ? "Fill out the form below and we'll get back to you as soon as possible"
                  : "Please log in to send us a message"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-700 font-medium">
                    Name
                  </Label>
                  <Input
                    id="name"
                    placeholder={
                      isAuthenticated
                        ? user?.username || "Enter your name"
                        : "Log in to continue"
                    }
                    className="bg-white text-gray-800 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={!isAuthenticated}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={
                      isAuthenticated
                        ? user?.email || "Enter your email"
                        : "Log in to continue"
                    }
                    className="bg-white text-gray-800 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={!isAuthenticated}
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="message"
                    className="text-gray-700 font-medium"
                  >
                    Message
                  </Label>
                  <Textarea
                    id="message"
                    placeholder={
                      isAuthenticated
                        ? "Type your message here"
                        : "Log in to continue"
                    }
                    className="bg-white text-gray-800 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    disabled={!isAuthenticated}
                  />
                </div>

                {submitStatus === "success" && (
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 p-2 rounded">
                    <CheckCircle className="h-5 w-5" />
                    <p>Message sent successfully!</p>
                  </div>
                )}

                {submitStatus === "error" && (
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 p-2 rounded">
                    <AlertCircle className="h-5 w-5" />
                    <p>
                      {errorMessage ||
                        "Please fill all required fields correctly."}
                    </p>
                  </div>
                )}

                {isAuthenticated ? (
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                    onClick={() => router.push("/login")}
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Log in to Send Message
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>
          <div className="space-y-6">
            <Card className="border-blue-100 shadow-sm hover:shadow-md transition-shadow bg-white">
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2 text-gray-800">
                  <Mail className="h-5 w-5 text-blue-600" />
                  Email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">yashaswanyashu@gmail.com</p>
              </CardContent>
            </Card>
            <Card className="border-blue-100 shadow-sm hover:shadow-md transition-shadow bg-white">
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2 text-gray-800">
                  <Phone className="h-5 w-5 text-blue-600" />
                  Phone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">+977 9849201040</p>
              </CardContent>
            </Card>
            <Card className="border-blue-100 shadow-sm hover:shadow-md transition-shadow bg-white">
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2 text-gray-800">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  Social Media
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Follow us on Twitter @StatValueAI
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
