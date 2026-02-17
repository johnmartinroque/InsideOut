import React from "react";
import CompanionsList from "../components/profile/CompanionsList";
import ElderlyInformation from "../components/profile/ElderlyInformation";

function Profile() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-start pt-24 md:pt-16 pb-16 px-4 md:px-10">
      
      {/* Page Title */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 relative inline-block">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
            Profile Overview
          </span>
        </h1>
        <div className="mt-4 w-24 h-1.5 bg-gradient-to-r from-blue-500 to-green-500 mx-auto rounded-full"></div>
      </div>

      {/* Main Container - Stacked for maximum width */}
      <div className="flex flex-col gap-10 w-full max-w-6xl">
        {/* Each component now takes up 100% of the max-width */}
        <section className="w-full">
           <ElderlyInformation />
        </section>
        
        <section className="w-full">
           <CompanionsList />
        </section>
      </div>
    </div>
  );
}

export default Profile;
