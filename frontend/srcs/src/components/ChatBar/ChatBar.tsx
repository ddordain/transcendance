import React from "react";
import FriendsList from "./FriendsList/FriendsList";
import ProfilBox from "./ProfilBox/ProfilBox";

function ChatBar() {
  return (
    <div>
      <div className="shadow-md bg-gray-900 h-screen">
        <div className="pt-4 pb-2 px-6">
          <ProfilBox />
        </div>
        <hr className="bg-orange-200 my-2" />
        <FriendsList />
      </div>
    </div>
  );
}

export default ChatBar;