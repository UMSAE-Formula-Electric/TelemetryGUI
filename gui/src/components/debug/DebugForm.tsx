import React from "react";
import styled from "styled-components";

const DebugForm = () => {
  return (
    <>
      <Container></Container>
      <Menu></Menu>
    </>
  );
};

export default DebugForm;

const Container = styled.div`
  grid-area: container;
  display: grid;
  background-color: white;
`;

const Menu = styled.div`
  grid-area: menu;
  display: grid;
  background-color: #e4e4e4;
`;
