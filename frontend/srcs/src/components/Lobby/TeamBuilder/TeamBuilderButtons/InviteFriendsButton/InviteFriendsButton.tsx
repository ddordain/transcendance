import { useAtom } from "jotai";
import React, { FormEvent, useState } from "react";
import { AiOutlineUsergroupAdd } from "react-icons/ai";
import Popup from "reactjs-popup";
import { COLORS } from "../../../../../colors";
import { friendAtom, lobbyAtom } from "../../../../../services/store";
import { TFriend } from "../../../../../services/type";
import InviteFriendCard from "./InviteFriendCard/InviteFriendCard";
import {
  InviteFriendButtonContainer,
  ModalBox,
  StyledButton,
} from "./InviteFriendsButtonStyle";
import useAxiosPrivate from "../../../../../hooks/useAxiosPrivate";
import { AxiosError, AxiosResponse } from "axios";

function InviteFriendsButton() {
  const [open, setOpen] = useState(false);
  const [invitedFriends, setInvitedFriends] = useState<string[]>([]);
  const [friendList, setFriendList] = useAtom(friendAtom);
  const [lobby, setLobby] = useAtom(lobbyAtom);
  const axiosPrivate = useAxiosPrivate();

  function handleAddFriends(name: string) {
    if (!invitedFriends.includes(name)) {
      setInvitedFriends((prev) => [...prev, name]); //on ajoute le user a inviter
    } else {
      setInvitedFriends((prev) => prev.filter((user) => user !== name)); //on filtre les users pour supprimer l'user
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const invitations = invitedFriends.map((user) => {
      return { type: "LOBBY", userId: user, lobbyId: lobby.id };
    });
    axiosPrivate
      .post("/invitations/createMany", invitations)
      .then((res: AxiosResponse) => {
        console.log("invitations created");
      })
      .catch((error: AxiosError) => {
        console.log("error creating invitations");
      });
  };

  return (
    <InviteFriendButtonContainer>
      <Popup
        trigger={
          <div>
            <AiOutlineUsergroupAdd
              onClick={() => setOpen(true)}
              size={22}
              style={{ color: COLORS.secondary }}
            />
          </div>
        }
        modal
        open={open}
        nested
      >
        <ModalBox>
          <div>
            {friendList.map((val, index) => {
              return (
                <div key={index} onClick={() => handleAddFriends(val.id)}>
                  <p
                    key={index}
                    className={invitedFriends.includes(val.id) ? "callout" : ""}
                  >
                    {val.username}
                  </p>
                </div>
              );
            })}
          </div>
          {/* <li>
            {friendList.map((val: TFriend) => {
              return <InviteFriendCard key={val.id} friend={val} />;
            })}
          </li> */}
          <StyledButton onClick={handleSubmit} type="submit" value="Invite" />
        </ModalBox>
      </Popup>
    </InviteFriendButtonContainer>
  );
}

export default InviteFriendsButton;