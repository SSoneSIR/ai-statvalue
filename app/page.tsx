"use client";

import { useRouter } from "next/navigation";
import { Button } from "../components/ui/button";
import { Slot } from "@radix-ui/react-slot";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  ArrowRight,
  GitCompare,
  TrendingUp,
  BarChart,
  Brain,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "../app/context/AuthContext";
import toast from "react-hot-toast";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const handleLearnMore = (section: string) => {
    router.push(`/about?section=${section}`);
  };

  const handleAuthenticatedRoute = (route: string) => {
    if (isAuthenticated) {
      router.push(route);
    } else {
      toast.error("Please log in to access this feature");
      setTimeout(() => router.push("/login"), 1500);
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

  const MotionCard = motion(Card);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <motion.section
        className="py-16 md:py-24 lg:py-32"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="container mx-auto px-4 text-center">
          <motion.div variants={itemVariants} className="mb-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-6">
              AI-Powered Football Analytics
            </h1>
            <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
              Compare players, predict market values, and discover similar
              talents using advanced AI and machine learning
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center mt-8"
          >
            <motion.button
              onClick={() => handleAuthenticatedRoute("/compare")}
              className="px-6 py-3 text-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 rounded-md"
            >
              <span className="flex items-center">
                Start Comparing <BarChart className="ml-2 h-5 w-5" />
              </span>
            </motion.button>

            <motion.button
              onClick={() => handleAuthenticatedRoute("/predict")}
              className="px-6 py-3 text-lg bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 rounded-md"
            >
              <span className="flex items-center">
                Predict Values <TrendingUp className="ml-2 h-5 w-5" />
              </span>
            </motion.button>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Our Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <MotionCard
              className="border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden"
              whileHover={{
                scale: 1.03,
                boxShadow:
                  "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500 opacity-10 rounded-full -mr-10 -mt-10"></div>
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <GitCompare className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl font-bold text-blue-700">
                  Compare Players
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  Compare detailed statistics between any two players and
                  discover insights that numbers alone can't tell you.
                </p>
                <button
                  onClick={() => handleLearnMore("compare")}
                  className="text-blue-600 font-medium hover:text-blue-800 transition-colors flex items-center"
                >
                  Learn more <ArrowRight className="ml-1 h-4 w-4" />
                </button>
              </CardContent>
            </MotionCard>

            <MotionCard
              className="border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-purple-100 overflow-hidden"
              whileHover={{
                scale: 1.03,
                boxShadow:
                  "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500 opacity-10 rounded-full -mr-10 -mt-10"></div>
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-xl font-bold text-purple-700">
                  Market Value Predictions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  Get AI-powered predictions for player market values based on
                  performance metrics and market trends.
                </p>
                <button
                  onClick={() => handleLearnMore("predict")}
                  className="text-purple-600 font-medium hover:text-purple-800 transition-colors flex items-center"
                >
                  Learn more <ArrowRight className="ml-1 h-4 w-4" />
                </button>
              </CardContent>
            </MotionCard>

            <MotionCard
              className="border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100 overflow-hidden"
              whileHover={{
                scale: 1.03,
                boxShadow:
                  "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-green-500 opacity-10 rounded-full -mr-10 -mt-10"></div>
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-xl font-bold text-green-700">
                  AI-Powered Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  Our advanced AI models analyze player performance data to
                  provide insights that traditional statistics miss.
                </p>
                <button
                  onClick={() => handleLearnMore("ai")}
                  className="text-green-600 font-medium hover:text-green-800 transition-colors flex items-center"
                >
                  Learn more <ArrowRight className="ml-1 h-4 w-4" />
                </button>
              </CardContent>
            </MotionCard>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <motion.section
        className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to elevate your football analytics?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of scouts, analysts, and football enthusiasts who are
            using StatValue AI to gain a competitive edge.
          </p>
          <Link href="/register">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Get Started Today
            </Button>
          </Link>
        </div>
      </motion.section>
    </div>
  );
}
