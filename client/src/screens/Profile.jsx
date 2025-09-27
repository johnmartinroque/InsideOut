import React from "react";
import ElderlyInfo from "../components/profile/ElderlyInfo";
import CompanionInfo from "../components/profile/CompanionInfo";

function Profile() {
  return (
    <div className="flex flex-col items-center gap-10">
      <CompanionInfo />
      <ElderlyInfo />
    </div>
  );
}

export default Profile;
