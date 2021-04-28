import * as React from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 5px;
`;

const LabelWrapper = styled.div`
  width: 200px;
  height: 60px;
  background-color: skyblue;
  border: 1px solid black;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Label = ({ powerRatings, voltage, total, children }) => {
  return (
    <Wrapper>
      {!!total && <span>{total}kW</span>}
      <LabelWrapper>{children}</LabelWrapper>
      {!!powerRatings && <span>{powerRatings}kW</span>}
      {!!voltage && <span>{voltage}v</span>}
    </Wrapper>
  );
};

export default Label;
