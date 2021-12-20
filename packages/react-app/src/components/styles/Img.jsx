import styled from "styled-components";

export const Icon = styled.img`
  height: 20px;
  width: auto;
  margin-right: ${props => props.marginRight};
  margin-left: ${props => props.marginLeft};
`;

export const LogoImg = styled.img`
  width: 40px;
  height: auto;
`

export const Avatar = styled.img`
  border-radius: 50px;
  width: 50px;
  height: auto;
  margin-left: 15px;
  margin-bottom: ${props => props.marginBottom};
`

export const DashboardAvatar = styled.img`
  border-radius: 50px;
  width: 75px;
  height: auto;
`
