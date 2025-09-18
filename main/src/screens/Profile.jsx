import React from "react";
import AddCompanion from "../components/AddCompanion";
import Companions from "../components/Companions";

function Profile() {
  return (
    <div>
      <div>
        <h1>Profile</h1>
      </div>
      <AddCompanion />
      <Companions />
    </div>
  );
}

export default Profile;
