
// import React from "react";
// import DashboardWrapper from "@/components/DashboardWrapper";

// export default function HomePage() {
//   return (
//     // <main className="p-4">
//     //   <DashboardWrapper />
//     // </main>
    
//   );
// }


"use client";
import React, { useState, useEffect } from 'react';
import { Upload, BarChart3, MessageSquare, Zap, FileSpreadsheet, TrendingUp, Eye, Brain, ChevronRight, CheckCircle, Star, ArrowRight, Play, Users, Shield, Clock } from 'lucide-react';
import { useRouter } from "next/navigation";
const ChatWithDataLanding = () => {
  const [isVisible, setIsVisible] = useState(false);

  const router = useRouter();
   const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent any form-like behavior
    router.push("/Insights");
  };

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: <Upload className="w-8 h-8" />,
      title: "Upload & Process",
      description: "Simply drag and drop your CSV or Excel files. Our AI instantly reads and understands your data structure."
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI Analysis",
      description: "Advanced LLM technology automatically discovers patterns, trends, and anomalies in your data."
    },
    {
      icon: <Eye className="w-8 h-8" />,
      title: "Visual Insights",
      description: "Get beautiful charts, graphs, and visualizations that make your data story clear and compelling."
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "Conversational Interface",
      description: "Ask questions about your data in plain English and get instant, intelligent responses."
    }
  ];

  const benefits = [
    "No data analysis expertise required",
    "Instant insights from any dataset",
    "Professional-grade visualizations",
    "Secure data processing",
    "Export-ready reports",
    "24/7 AI-powered analysis"
  ];

  // const testimonials = [
  //   {
  //     name: "Sarah Chen",
  //     role: "Marketing Director",
  //     content: "ChatWithData transformed how we analyze campaign performance. What used to take hours now takes minutes.",
  //     rating: 5
  //   },
  //   {
  //     name: "Michael Rodriguez",
  //     role: "Business Analyst",
  //     content: "The AI insights are incredibly accurate. It's like having a data scientist available 24/7.",
  //     rating: 5
  //   },
  //   {
  //     name: "Emma Thompson",
  //     role: "Operations Manager",
  //     content: "Finally, a tool that makes data analysis accessible to everyone on our team.",
  //     rating: 5
  //   }
  // ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
           
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-950 to-indigo-950 bg-clip-text text-transparent">
              Analyt<span className='text-red-800'>IQ</span>
            </h1>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-slate-700 hover:text-blue-600 transition-colors">Features</a>
            <a href="#how-it-works" className="text-slate-700 hover:text-blue-600 transition-colors">How it Works</a>
            {/* <a href="#testimonials" className="text-slate-700 hover:text-blue-600 transition-colors">Testimonials</a> */}
            <button onClick={handleClick} className="bg-gradient-to-r from-slate-950 to-slate-900 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              Get Started
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-flex items-center bg-slate-200 text-slate-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4 mr-2" />
              AI-Powered Data Analysis
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight">
Let your data tell the story that drives         <span className="bg-gradient-to-r from-orange-800 to-orange-800 bg-clip-text text-transparent">  smart decisions.</span>
            </h1>
            <p className="text-xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Upload your CSV or Excel files and let our advanced AI analyze your data instantly. No technical expertise required - just upload, ask, and discover powerful insights through intelligent conversation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-red-600 to-red-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center">
                <Play className="w-5 h-5 mr-2" />
                Get Started Free
              </button>
              {/* <button className="bg-white text-slate-700 px-8 py-4 rounded-xl font-semibold text-lg border-2 border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 flex items-center justify-center">
                Watch Demo
                <ArrowRight className="w-5 h-5 ml-2" />
              </button> */}
            </div>
          </div>
        </div>
      </section>

      {/* Demo Preview */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4 flex items-center">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="text-slate-300 text-sm ml-4">ChatWithData Dashboard</div>
            </div>
            <div className="h-96 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-slate-600 to-slate-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Upload className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Interactive Demo Coming Soon</h3>
                <p className="text-slate-600">Experience the power of AI-driven data analysis</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Powerful Features for
              <span className="bg-gradient-to-r from-orange-800 to-orange-800 bg-clip-text text-transparent"> Everyone</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Our AI-powered platform makes data analysis accessible to everyone, regardless of technical background.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group bg-slate-50 rounded-2xl p-8 hover:bg-white hover:shadow-xl transition-all duration-300 border border-slate-100">
                <div className="text-slate-600 mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Simple 3-Step Process
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Get from raw data to actionable insights in minutes, not hours.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-r from-slate-600 to-slate-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <FileSpreadsheet className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">1. Upload Your Data</h3>
              <p className="text-slate-600 leading-relaxed">
                Simply drag and drop your CSV or Excel files. Our AI instantly processes and understands your data structure.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-r from-slate-600 to-slate-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <MessageSquare className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">2. Ask Questions</h3>
              <p className="text-slate-600 leading-relaxed">
                Chat with your data using natural language. Ask anything from simple statistics to complex trend analysis.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-r from-slate-600 to-slate-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">3. Get Insights</h3>
              <p className="text-slate-600 leading-relaxed">
                Receive instant analysis with beautiful visualizations, key findings, and actionable recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                Why Choose Analyt
                <span className="bg-gradient-to-r from-orange-800 to-orange-800 bg-clip-text text-transparent">IQ?</span>
              </h2>
              <p className="text-xl text-slate-600 mb-8">
                Democratize data analysis across your organization with AI-powered insights that anyone can understand and act upon.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="w-6 h-6 text-red-500 mr-3 flex-shrink-0" />
                    <span className="text-slate-700 text-lg">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button className="bg-gradient-to-r from-slate-600 to-slate-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  Start Free Trial
                </button>
                <button className="text-blue-600 font-semibold hover:text-blue-700 transition-colors flex items-center">
                  Learn More
                  <ChevronRight className="w-5 h-5 ml-1" />
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl p-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <Users className="w-8 h-8 text-slate-600 mb-3" />
                    <div className="text-2xl font-bold text-slate-900">1k+</div>
                    <div className="text-slate-600">Active Users</div>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <BarChart3 className="w-8 h-8 text-slate-600 mb-3" />
                    <div className="text-2xl font-bold text-slate-900">50+</div>
                    <div className="text-slate-600">Files Analyzed</div>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <Shield className="w-8 h-8 text-slate-600 mb-3" />
                    <div className="text-2xl font-bold text-slate-900">99.9%</div>
                    <div className="text-slate-600">Uptime</div>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <Clock className="w-8 h-8 text-slate-600 mb-3" />
                    <div className="text-2xl font-bold text-slate-900">&lt;30s</div>
                    <div className="text-slate-600">Avg Analysis</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {/* <section id="testimonials" className="py-20 px-6 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Loved by Teams Worldwide
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              See how organizations are transforming their data analysis workflow with ChatWithData.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-slate-700 mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-slate-900">{testimonial.name}</div>
                  <div className="text-slate-500 text-sm">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      {/* <section className="py-20 px-6 bg-gradient-to-r from-slate-70 to-slate-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Data Analysis?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of teams who've already discovered the power of AI-driven insights. Start your free trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              Start Free Trial
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300">
              Schedule Demo
            </button>
          </div>
          <p className="text-blue-200 text-sm mt-6">No credit card required • 14-day free trial • Cancel anytime</p>
        </div>
      </section> */}

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                
                <h3 className="text-xl font-bold">Analyt<span className='text-xl font bold text-red-800'>IQ</span></h3>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Empowering everyone to discover insights from their data through the power of AI conversation.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm">© 2025 AnalytIQ. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Privacy Policy</a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Terms of Service</a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
      
    </div>
  );
};

export default ChatWithDataLanding;