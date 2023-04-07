import styled from "styled-components";
import { COLORS } from "../../colors";
import { screenSize } from "../../mediaSize";

export const MainLayoutContainer = styled.div`
  height: 100vh;
  width: 100%;
  display: flex;
  @media (max-width: ${screenSize.laptop}) {
    flex-direction: column;
  }
  @media (min-width: ${screenSize.laptop}) {
    overflow-x: hidden;
    min-height: 600px;
  }
`;

export const MainContainer = styled.main`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

export const PageContainer = styled.div`
  background-color: ${COLORS.darkergrey};
  flex-grow: 1;
  width: 100%;
  padding: 16px;
  min-width: 280px;
  @media (max-width: ${screenSize.laptop}) {
    padding: 8px;
  }
  box-sizing: border-box;
`;

export const NavBarContainer = styled.div`
  width: 100%;
  flex-shrink: 0;
  @media (max-width: ${screenSize.laptop}) {
    height: 60px;
  }
  @media (min-width: ${screenSize.laptop}) {
    height: 112px;
  }
  display: flex;
  justify-content: space-between;
`;