// src/pages/LandingPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Shield,
  Coins,
  Lock,
  TrendingUp,
  CheckCircle2,
  Users,
  BarChart,
  ArrowRight,
} from "lucide-react";
import Logo from "@/components/Logo";

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: "Secure Transactions",
      description:
        "Utilize blockchain-powered smart contracts for tamper-proof rental agreements. Every transaction is recorded on an immutable ledger.",
      image:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    },
    {
      icon: Coins,
      title: "Crypto Payments",
      description:
        "Pay or receive rent in cryptocurrencies like Bitcoin, Ethereum, or stablecoins. Enjoy instant settlements and low transaction fees.",
      image:
        "https://images.unsplash.com/photo-1620336655055-bd87c3e8d8f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    },
    {
      icon: Lock,
      title: "Smart Escrow",
      description:
        "Automate deposit management with secure smart contracts. Funds are held securely and released only when conditions are met.",
      image:
        "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    },
    {
      icon: TrendingUp,
      title: "Property Tokenization",
      description:
        "Invest in real estate through fractional ownership. Tokenize properties to buy, sell, or trade shares.",
      image:
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    },
    {
      icon: Users,
      title: "Community Governance",
      description:
        "Join a decentralized community where token holders can propose and vote on platform upgrades.",
      image:
        "https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    },
    {
      icon: BarChart,
      title: "Analytics Dashboard",
      description:
        "Gain insights with a powerful dashboard offering real-time data on rental performance and market trends.",
      image:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    },
  ];

  const stats = [
    { value: "$2.5B+", label: "Total Value Locked" },
    { value: "50K+", label: "Properties Listed" },
    { value: "200K+", label: "Active Users" },
    { value: "99.9%", label: "Platform Reliability" },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <nav className="fixed top-0 w-full bg-[#182a3a] backdrop-blur-md z-50 py-3 px-6">
        <div className="max-w-full mx-auto flex justify-between items-center">
          {/* Logo */}
          <Logo
            size="lg"
            logocolor="white"
            textcolor="#ffffff"
            className="gap-3"
          />

          {/* Navigation */}
          <div className="flex items-center gap-8">
            <a
              href="#features"
              className="text-white hover:text-gray-300 transition-colors font-medium"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-white hover:text-gray-300 transition-colors font-medium"
            >
              How It Works
            </a>

            <div className="flex gap-3">
              <button
                onClick={() => navigate("/signin")}
                className="px-6 py-2 text-white font-medium hover:text-gray-300 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="bg-white text-[#182a3a] px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 bg-gray-50 px-6 py-3 rounded-full border border-gray-200">
              <Shield className="h-6 w-6 text-[#182a3a]" />
              <span className="font-semibold text-[#182a3a]">
                Blockchain-Powered Real Estate
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Transform Real Estate with{" "}
              <span className="text-[#182a3a]">RealChain</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              RealChain revolutionizes real estate rentals and investments using
              blockchain technology. Enjoy secure, transparent, and automated
              solutions for property management, payments, and fractional
              ownership in a global marketplace.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate("/signup")}
                className="bg-[#182a3a] text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-[#182a3a]/90 transition-all transform hover:scale-105 flex items-center gap-2"
              >
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </button>
              <button
                onClick={() =>
                  document
                    .getElementById("features")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="border-2 border-[#182a3a] text-[#182a3a] px-8 py-4 rounded-xl text-lg font-semibold hover:bg-[#182a3a] hover:text-white transition-all"
              >
                Learn More
              </button>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
              alt="Modern Building"
              className="w-full h-[500px] object-cover rounded-2xl shadow-2xl"
            />
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-[#182a3a] p-2 rounded-full">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#182a3a]">50K+</div>
                  <div className="text-gray-600">Properties Listed</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#182a3a] mb-3">
                {stat.value}
              </div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#182a3a] mb-4">
              Why Choose RealChain
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              RealChain combines cutting-edge blockchain technology with real
              estate expertise to deliver a secure, transparent, and efficient
              platform.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 group"
              >
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-48 object-cover rounded-xl mb-4 group-hover:scale-105 transition-transform duration-300"
                />
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-[#182a3a] p-2 rounded-full group-hover:scale-110 transition-transform">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[#182a3a]">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#182a3a] mb-4">
              How RealChain Works
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Simple, secure, and efficient - RealChain streamlines the entire
              real estate process.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-200 hover:shadow-xl transition-all">
              <div className="bg-[#182a3a] p-4 rounded-full inline-flex mb-6">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#182a3a] mb-4">
                List Your Property
              </h3>
              <p className="text-gray-600">
                Create and list your property with smart contract-based
                agreements for complete transparency.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-200 hover:shadow-xl transition-all">
              <div className="bg-[#182a3a] p-4 rounded-full inline-flex mb-6">
                <Coins className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#182a3a] mb-4">
                Secure Payments
              </h3>
              <p className="text-gray-600">
                Accept instant crypto payments with automated escrow services
                and secure fund management.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-200 hover:shadow-xl transition-all">
              <div className="bg-[#182a3a] p-4 rounded-full inline-flex mb-6">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#182a3a] mb-4">
                Invest & Grow
              </h3>
              <p className="text-gray-600">
                Tokenize properties for fractional ownership and participate in
                real estate markets.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-[#182a3a] mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Join thousands of landlords, tenants, and investors who are already
            using RealChain to transform their real estate experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/signup")}
              className="bg-[#182a3a] text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-[#182a3a]/90 transition-all transform hover:scale-105"
            >
              Create Account
            </button>
            <button
              onClick={() => navigate("/signin")}
              className="border-2 border-[#182a3a] text-[#182a3a] px-8 py-4 rounded-xl text-lg font-semibold hover:bg-[#182a3a] hover:text-white transition-all"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-[#182a3a] text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <Logo
                size="lg"
                logocolor="white"
                textcolor="#ffffff"
                className="mb-4"
              />
              <p className="text-gray-300">
                Revolutionizing real estate with blockchain technology.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <a
                href="#features"
                className="block text-gray-300 hover:text-gray-100 mb-2 transition-colors"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="block text-gray-300 hover:text-gray-100 mb-2 transition-colors"
              >
                How It Works
              </a>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Resources</h4>
              <a
                href="#"
                className="block text-gray-300 hover:text-gray-100 mb-2 transition-colors"
              >
                Documentation
              </a>
              <a
                href="#"
                className="block text-gray-300 hover:text-gray-100 mb-2 transition-colors"
              >
                FAQ
              </a>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <a
                href="#"
                className="block text-gray-300 hover:text-gray-100 mb-2 transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="block text-gray-300 hover:text-gray-100 mb-2 transition-colors"
              >
                Privacy Policy
              </a>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-600 text-center">
            <p className="text-gray-300">
              &copy; 2025 RealChain. All rights reserved. Powered by blockchain
              technology.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
