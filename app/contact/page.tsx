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

// Mock auth function - replace with your actual auth implementation
const useAuth = () => {
  // Replace this with your actual auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ username: string } | null>(null);

  // Simulate fetching auth state
  useEffect(() => {
    // Replace this with your actual auth check
    const checkAuth = async () => {
      // This is just a placeholder - implement your actual auth check
      try {
        // For example: const response = await fetch('/api/auth/me');
        // const data = await response.json();
        // For demo purposes, uncomment to simulate logged in state:
        // setIsLoggedIn(true);
        // setUser({ username: "DemoUser" });
      } catch (error) {
        console.error("Auth check failed:", error);
      }
    };

    checkAuth();
  }, []);

  return { isLoggedIn, user };
};

export default function ContactPage() {
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(
    null
  );

  // Set the name field to user's username when component mounts and user is logged in
  useEffect(() => {
    if (user?.username) {
      setFormData((prev) => ({
        ...prev,
        name: user.username,
      }));
    }
  }, [user]);

  interface FormData {
    name: string;
    email: string;
    message: string;
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  interface SubmitEvent extends React.FormEvent<HTMLFormElement> {}

  const handleSubmit = async (e: SubmitEvent): Promise<void> => {
    e.preventDefault();

    if (!isLoggedIn) {
      router.push("/login"); // Redirect to login page
      return;
    }

    if (!formData.name || !formData.email || !formData.message) {
      setSubmitStatus("error");
      return;
    }

    setIsSubmitting(true);

    try {
      // Using mailto protocol as a simple solution
      const mailtoLink = `mailto:yashaswanyashu@gmail.com?subject=Contact Form Submission from ${encodeURIComponent(
        formData.name
      )}&body=${encodeURIComponent(
        `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
      )}`;

      window.open(mailtoLink, "_blank");

      // For a production app, you would typically use an API endpoint like:
      // await fetch('/api/send-email', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });

      setSubmitStatus("success");
      // Reset form after successful submission
      setFormData((prev) => ({
        ...prev,
        email: "",
        message: "",
      }));

      // Keep the name as user's username
      if (user?.username) {
        setFormData((prev) => ({
          ...prev,
          name: user.username,
        }));
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);

      // Clear status after 5 seconds
      setTimeout(() => {
        setSubmitStatus(null);
      }, 5000);
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
                {isLoggedIn
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
                      isLoggedIn
                        ? user?.username || "Enter your name"
                        : "Log in to continue"
                    }
                    className="bg-white text-gray-800 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={!isLoggedIn}
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
                      isLoggedIn ? "Enter your email" : "Log in to continue"
                    }
                    className="bg-white text-gray-800 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={!isLoggedIn}
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
                      isLoggedIn
                        ? "Type your message here"
                        : "Log in to continue"
                    }
                    className="bg-white text-gray-800 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    disabled={!isLoggedIn}
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
                    <p>Please fill all required fields.</p>
                  </div>
                )}

                {isLoggedIn ? (
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
