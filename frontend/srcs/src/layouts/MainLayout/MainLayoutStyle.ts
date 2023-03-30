import styled from "styled-components";
import { COLORS } from "../../colors";

export const MainLayoutStyle = styled.div`
  height: 100vh;
  display: flex;
  justify-content: end;
`;

export const MainLayoutContainer = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

export const ChatLayoutContainer = styled.div`
  width: 270px;
  background-color: #19191a;
`;

export const NavBarLayoutContainer = styled.div`
  display: flex;
  width: full;
  height: 98px;
  background-color: #19191a;
`;

export const HeaderContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
`;

export const NavBarContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -100%);
  color: ${COLORS.primary};
`;
