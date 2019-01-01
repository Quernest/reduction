// @flow
import React from 'react';
import type { Node } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

export default function Header(): Node {
  return (
    <Wrapper>
      <Logo to="/">Logo</Logo>
    </Wrapper>
  );
}

const Wrapper = styled.header`
  display: flex;
  align-items: center;
  padding: 20px;
  height: 75px;
  width: 100%;
  background-color: #18181e;
`;

const Logo = styled(Link)`
  text-decoration: none;
  font-size: 24px;
  font-weight: 700;
  transition: 220ms ease;
  color: #e1e2e2;

  &:hover {
    color: #dec79b;
  }
`;
