import styled from "styled-components";
// Header div styling

export const Nav = styled.div`
  display: flex;
  padding: ${props => props.padding};
  justify-content: ${props => props.justifyContent};

`;

export const FooterNav = styled.div`
  display: flex;
  bottom: 0;
  width: 100%;
  position: absolute;
  align-items: center;
  height: 75px;
  justify-content: space-around;
  border-top: solid 1px #000;
`
