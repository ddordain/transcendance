import React from "react";
import FriendsCards from "./FriendsCards/FriendsCards";
import { FriendsListBox } from "./FriendsListStyle";
import { useAtom } from "jotai";
import { friendAtom } from "../../../services/store";
import { TFriend } from "../../../services/type";

function FriendsList() {
  const [friendList] = useAtom(friendAtom);

  return (
    <FriendsListBox>
      {friendList.map((val: TFriend) => {
        return (
          <FriendsCards
            key={val.id}
            avatar={val.avatar}
            name={val.username}
            status={val.status}
          />
        );
      })}
    </FriendsListBox>
  );
}

export default FriendsList;
