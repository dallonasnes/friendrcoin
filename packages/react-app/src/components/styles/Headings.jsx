import styled from "styled-components";

export const H1 = styled.h1`
  text-transform: uppercase;
  font-size: 24px;
  margin-right: ${props => props.marginRight};
`;

export const BoxH2 = styled.h2`
  text-transform: uppercase;
  font-size: 16px;
  margin-bottom: ${props => props.marginBottom};
  margin-right: ${props => props.marginRight};
`;

export const Logo = styled.a`
  text-transform: uppercase;
  font-size: 35px;
  color: #000000;
  margin-right: 20px;

  &:hover {
    color: #000000;
  }
`
