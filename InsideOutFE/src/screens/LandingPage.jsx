import React from "react";
import { Link } from "react-router-dom";

function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-center px-6 pt-20 pb-10">
      {/* Hero Section */}
      <h1 className="text-6xl md:text-8xl font-extrabold mb-6 tracking-tight text-slate-800">
        Inside
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500">
          Out
        </span>
      </h1>
      
      <p className="text-lg md:text-2xl text-gray-600 max-w-3xl mb-10 leading-relaxed">
        An AI-powered system designed to monitor emotions of elderly individuals
        and provide calming responses, such as music, to improve their
        well-being.
      </p>

      {/* Primary Action - Changed to Slate/Black to match dark theme header */}
      <Link
        to="/register"
        className="px-10 py-4 bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-600 hover:-translate-y-1 transition-all duration-300"
      >
        Get Started
      </Link>

      {/* Features / Overview Section */}
      <div className="mt-20 grid gap-8 md:grid-cols-3 max-w-6xl w-full">
        <div className="p-8 bg-gray-50 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="text-blue-600 mb-4 text-3xl">👁️</div>
          <h3 className="text-xl font-bold mb-3 text-gray-800">
            Emotion Monitoring
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            Wearable devices and monitoring tools detect basic emotional states
            in real-time with precision.
          </p>
        </div>

        <div className="p-8 bg-gray-50 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="text-green-600 mb-4 text-3xl">🎵</div>
          <h3 className="text-xl font-bold mb-3 text-gray-800">
            Relaxing Music
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            AI selects calming music based on the detected emotions to enhance
            mood and reduce stress.
          </p>
        </div>

        <div className="p-8 bg-gray-50 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="text-purple-600 mb-4 text-3xl">📊</div>
          <h3 className="text-xl font-bold mb-3 text-gray-800">
            Unified Dashboard
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            Companions can access a central hub to manage profiles, view 
            live monitoring, and coordinate care effortlessly.
          </p>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;