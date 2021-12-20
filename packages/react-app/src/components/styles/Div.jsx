import styled from "styled-components";

export const FlexDiv = styled.div`
  display: flex;
  height: ${props => props.height};
  width: ${props => props.width};
  margin-right: ${props => props.marginRight};
  align-items: ${props => props.alignItems};
  flex-direction: ${props => props.flexDirection};
  justify-content: ${props => props.justifyContent};
  flex-wrap: ${props => props.flexWrap};
  padding: ${props => props.padding};
  margin-bottom: ${props => props.marginBottom};
  background: ${props => props.background};
  border-radius: ${props => props.borderRadius};
`;
