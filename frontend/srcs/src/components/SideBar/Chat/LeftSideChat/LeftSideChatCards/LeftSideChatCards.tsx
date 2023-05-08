import React, { useContext, useEffect, useState } from "react";
import { COLORS, convertStatusColor } from "../../../../../colors";
import { ProfileBoxStatus } from "../../../ProfileBox/ProfilBoxStyle";
import {
  ChatManagerNameStatus,
  ChatManagerUserName,
  LeftSideChatCardsRightBox,
  UserChatManagerBox,
} from "./LeftSideChatCardsStyle";
import { FaCrown } from "react-icons/fa";
import { TbSword } from "react-icons/tb";
import Popup from "reactjs-popup";
import {
  FriendsPopUpButton,
  InsidePopUpButton,
  PopUpBox,
} from "../../../FriendsList/FriendsCards/FriendsCardsStyle";
import { BsThreeDotsVertical } from "react-icons/bs";
import { SocketContext } from "../../../../../services/Auth/SocketContext";
import { BiVolumeMute } from "react-icons/bi";
import useAxiosPrivate from "../../../../../hooks/useAxiosPrivate";
import AdminInteraction from "./AdminInteraction";
import { useAtom } from "jotai";
import { userAtom } from "../../../../../services/store";

function LeftSideChatCards(props: {
  roomId: string;
  userId: string;
  name: string;
  status: string;
  role: string;
  mute: Date;
  isAdmin: boolean;
}) {
  const [user, setUser] = useAtom(userAtom);
  const socket = useContext(SocketContext);
  const axiosPrivate = useAxiosPrivate();

  function displayRole(role: string) {
    if (role == "ADMIN")
      return <TbSword style={{ color: COLORS.secondary }} size={22} />;
    else if (role == "OWNER")
      return <FaCrown style={{ color: COLORS.secondary }} size={22} />;
  }

  const handleClick = () => {
    socket?.emit("friend-request", props.name);
  };

  return (
    <UserChatManagerBox>
      <ChatManagerNameStatus>
        <ChatManagerUserName>
          {user.username == props.name ? "YOU" : props.name.toLocaleUpperCase()}
        </ChatManagerUserName>
        <ProfileBoxStatus
          style={{ backgroundColor: convertStatusColor(props.status) }}
        />
      </ChatManagerNameStatus>
      <LeftSideChatCardsRightBox>
        {displayRole(props.role)}
        <Popup
          position="left center"
          arrowStyle={{ color: COLORS.background }}
          trigger={
            <>
              {user.username == props.name ? (
                <></>
              ) : (
                <FriendsPopUpButton>
                  <BsThreeDotsVertical
                    style={{ opacity: "50%", color: COLORS.primary }}
                    size={22}
                  />
                </FriendsPopUpButton>
              )}
            </>
          }>
          <PopUpBox>
            <InsidePopUpButton onClick={handleClick}>
              Add to friends
            </InsidePopUpButton>
            <InsidePopUpButton>Block user</InsidePopUpButton>
            {props.isAdmin ? (
              <AdminInteraction
                userId={props.userId}
                roomId={props.roomId}
                mute={props.mute}
              />
            ) : (
              ""
            )}
          </PopUpBox>
        </Popup>
      </LeftSideChatCardsRightBox>
    </UserChatManagerBox>
  );
}

export default LeftSideChatCards;
