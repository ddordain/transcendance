import React from "react";
import { Navigate, useNavigate } from "react-router-dom";
import ChatBar from "../ChatBar/ChatBar";
import Games from "../Game/Game";

function Home() {
  const navigate = useNavigate();

  return (
    <div>
      HomePage
    </div>
  );
}

export default Home;