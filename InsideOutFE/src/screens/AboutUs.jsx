import React from "react";

function AboutUs() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="relative w-full flex flex-col items-center justify-center pt-14 pb-16 px-6 text-center overflow-hidden">
        <div className="relative z-10 flex flex-col items-center">
          <h1 className="text-5xl md:text-5xl font-extrabold mb-10 tracking-tight text-slate-800">
            About 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500 ml-3">
              Us
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mb-2 leading-relaxed font-medium">
            Welcome to <span className="font-bold text-slate-800">InsideOut</span>, an
            AI-powered emotion monitoring system created to support{" "}
            <span className="text-blue-600 font-semibold">elderly individuals</span>. Our goal
            is to provide a compassionate tool that helps companions and
            caregivers better understand and respond to the emotional needs of
            the elderly.
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="max-w-4xl mx-auto px-6 mb-20 text-center">
        <div className="bg-gray-50 rounded-3xl border border-gray-100 p-10 shadow-sm">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">
            Our Mission
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            We aim to improve the emotional well-being of elderly individuals
            through AI-assisted monitoring. By combining vital sign tracking 
            and supportive feedback, we strive to foster healthier, happier,
            and more connected lives.
          </p>
        </div>
      </div>

      {/* Benefits Grid */}
      <div className="max-w-6xl mx-auto px-6 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm text-center hover:shadow-md transition-shadow">
            <h3 className="text-xl font-bold text-blue-600 mb-3">
              Compassionate Support
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Helps caregivers identify and respond to negative emotions
              promptly and effectively.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm text-center hover:shadow-md transition-shadow">
            <h3 className="text-xl font-bold text-green-600 mb-3">
              Health Monitoring
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Wearable devices track vital signs such as heart rate to detect 
              physical stress or discomfort.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm text-center hover:shadow-md transition-shadow">
            <h3 className="text-xl font-bold text-blue-600 mb-3">
              Elderly-Friendly
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Designed with simplicity and accessibility in mind for
              older users and their companions.
            </p>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-gray-50 py-20 px-6 text-center">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-extrabold text-slate-800 mb-4">
            Meet the Team
          </h2>
          <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
            A passionate group of students and innovators working together to
            make emotional well-being more accessible through technology.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12">
            {/* Member 1 */}
            <div className="flex flex-col items-center group">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-blue-600 text-4xl font-black shadow-inner border-2 border-white group-hover:scale-110 transition-transform duration-300">
                J
              </div>
              <p className="mt-5 text-slate-800 font-bold text-lg">
                Jon Cain C. Rivera
              </p>
              <p className="text-blue-500 text-sm font-medium">Developer</p>
            </div>

            {/* Member 2 */}
            <div className="flex flex-col items-center group">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center text-green-600 text-4xl font-black shadow-inner border-2 border-white group-hover:scale-110 transition-transform duration-300">
                M
              </div>
              <p className="mt-5 text-slate-800 font-bold text-lg">
                John Martin L. Roque
              </p>
              <p className="text-green-500 text-sm font-medium">Developer</p>
            </div>

            {/* Member 3 */}
            <div className="flex flex-col items-center group">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-blue-600 text-4xl font-black shadow-inner border-2 border-white group-hover:scale-110 transition-transform duration-300">
                I
              </div>
              <p className="mt-5 text-slate-800 font-bold text-lg">
                Irah Lourene T. Tanhueco
              </p>
              <p className="text-blue-500 text-sm font-medium">Developer</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutUs;