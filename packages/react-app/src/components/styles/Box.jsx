import styled from "styled-components";

export const FakeMessageBox = styled.div`
  display: inline-block;
  background: #e5caca;
  margin: auto;
  padding: 30px 30px 10px 30px;
  width: 75vw;
  height: 100%;
  border-radius: 40px;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
`;

export const sideMessageBox = styled.div`

`

// Each message log inside the Message Box
export const MessageRow = styled.div`
  display: grid;
  grid-template-columns: 10px 50px 150px auto repeat(4, 30px);
  margin: 5px;
  align-items: center;
`;

export const ChatLog = styled.div`
  border-radius: 50px;
  margin-right: 15px;
  padding: 10px 0;
  background: ${props => props.backgroundColor};
`;
