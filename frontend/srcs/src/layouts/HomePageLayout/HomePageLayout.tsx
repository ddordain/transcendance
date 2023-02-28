import React from "react";
import ChatBar from "../../components/ChatBar/ChatBar";
import Game from "../../components/Game/Game";

function HomePageLayout() {
  return (
    <main>
      <div
        className="inline-block align-top box-border"
        style={{ width: "85vw" }}
      >
        {/* <Game /> Temporary component */}
      </div>
      <div
        className="absolute inset-y-0 right-0 w-72"
      >
        <ChatBar />
      </div>
    </main>
  );
}

export default HomePageLayout;
