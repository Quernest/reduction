// @flow
import React from 'react';
import type { Node } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

function App(): Node {
  return (
    <Wrapper>
      <Title>Reduction</Title>
      <Link to="pca">PCA</Link>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 960px;
  margin-left: auto;
  margin-right: auto;
  padding: 20px;
`;

const Title = styled.h1`
  margin-top: 16px;
  margin-bottom: 16px;
  font-size: 36px;
  font-style: normal;
  font-weight: 300;
  line-height: 1.5;
  color: #151f26;
`;

export default App;
