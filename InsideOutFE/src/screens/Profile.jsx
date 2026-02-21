import React from "react";
import CompanionsList from "../components/profile/CompanionsList";
import ElderlyInformation from "../components/profile/ElderlyInformation";

function Profile() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-start pt-10 md:pt-10 pb-16 px-4 md:px-10">
      
      {/* Page Title */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Profile{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500">
            Overview
          </span>
        </h2>
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
