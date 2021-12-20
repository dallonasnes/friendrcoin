import styled from "styled-components";

export const HeaderButton = styled.button`
  width: 200px;
  height: 40px;
  background: ${props => props.background};

  border: 1px solid #000000;
  box-sizing: border-box;
  border-radius: 50px;
  margin-right: 30px;
  color: #000000;

  &:hover {
    background: ${props => props.hoverBackground};
    cursor: pointer;
  }
`;

export const WalletButton = styled.button`
  width: 200px;
  height: 40px;
  background: ${props => props.background};
  border: 1px solid #000000;
  box-sizing: border-box;
  border-radius: 50px;
  color: #000000;
  margin: 18px;

  &:hover {
    background: ${props => props.hoverBackground};
    cursor: pointer;
  }

`

export const MessageBoxButton = styled.button`
  width: 250px;
  border-radius: 50px;

  height: 35px;
  background: transparent;
  margin-right: 30px;
  color: #000000;

  &:hover {
    background: #CDBEBE;
    cursor: pointer;
  }
`
