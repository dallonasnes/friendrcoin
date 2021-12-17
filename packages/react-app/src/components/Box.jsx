import styled from "styled-components";

export const FakeMessageBox = styled.div`
  display: inline-block;
  background: #e5caca;
  margin: auto;
  padding: 35px;
  width: 75vw;
  height: 100%;
  border-radius: 50px;
`;

export const MessageRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 5px;
  align-items: center;
`;

export const ChatLog = styled.div`
  width: 75%;
  border-radius: 50px;
  padding: 15px;
  background: ${props => props.backgroundColor};
`;
