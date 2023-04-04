import React, { ChangeEvent, ChangeEventHandler } from "react";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useNavigate, useLocation } from "react-router";
import { AxiosError, AxiosResponse } from "axios";
import {
  ExperienceBar,
  ProfilBoxLink,
  ProfilBoxLeft,
  ProfileBoxStatus,
  LevelExperienceBar,
  ExperienceBarContainer,
  ProfilBoxRight,
  CurrencyContainer,
  StyledSelect,
  SelectBox,
  ProfilBoxName,
} from "./ProfilBoxStyle";
import { TbCurrencyShekel } from "react-icons/tb";
import { COLORS, convertStatusColor } from "../../../colors";
import { useAtom } from "jotai";
import { userAtom, userPreferencesAtom } from "../../../services/store";

function ProfilBox() {
  const axiosPrivate = useAxiosPrivate();
  const [user, setUser] = useAtom(userAtom);
  const [userPreferences, setUserPreferences] = useAtom(userPreferencesAtom);
  const navigate = useNavigate();
  const location = useLocation();

  var changeStatusVisibility: ChangeEventHandler = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const optionSelected = event.target.value;
    axiosPrivate
      .post("/users/me/visibility", {
        status: optionSelected,
      })
      .catch((res: AxiosError) =>
        navigate("/login", { state: { from: location }, replace: true })
      );
  };

  return (
    <ProfilBoxLink>
      <ProfilBoxLeft>
        <ProfilBoxName>
          {user?.username.toLocaleUpperCase()}
          <ProfileBoxStatus
            style={{
              backgroundColor: convertStatusColor(user.status),
            }}
          />
        </ProfilBoxName>
        <ExperienceBarContainer>
          <ExperienceBar>
            <LevelExperienceBar />
          </ExperienceBar>
          <h5>10</h5>
        </ExperienceBarContainer>
      </ProfilBoxLeft>
      <ProfilBoxRight>
        <CurrencyContainer>
          <h5>{user?.balance}</h5>
          <TbCurrencyShekel style={{ color: COLORS.secondary }} size={24} />
        </CurrencyContainer>
        <SelectBox>
          <StyledSelect
            value={userPreferences.visibility.toUpperCase()}
            onChange={changeStatusVisibility}>
            <option>VISIBLE</option>
            <option>AWAY</option>
            <option>INVISIBLE</option>
          </StyledSelect>
        </SelectBox>
      </ProfilBoxRight>
    </ProfilBoxLink>
  );
}

export default ProfilBox;
