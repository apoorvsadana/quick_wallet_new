import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect } from 'react';
import styled from 'styled-components';
import config from '../../config/config.json';
import { faExchange, faCog } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from 'react-redux';
import { selectPage } from '../../features/wallet/navbarSlice';

const Container = styled.div`
  background-color: #2b2b2b;
  height: ${config.bottomBarHeight + 'px'};
  border-top: 1px solid rgb(58, 58, 58);
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

const StyledFontAwesomeIcon = styled(FontAwesomeIcon)`
  cursor: pointer;
  :hover {
    color: white;
  }
`;

const BottomBar = ({ bottomBarSelected, setBottomBarSelected }) => {
  console.log('this bottom bar selected - ', bottomBarSelected);
  return (
    <Container>
      <StyledFontAwesomeIcon
        style={{ marginRight: '4%' }}
        icon={faExchange}
        color={bottomBarSelected == 0 ? 'white' : 'grey'}
        onClick={() => setBottomBarSelected(0)}
        size="2x"
      />
      <StyledFontAwesomeIcon
        icon={faCog}
        color={bottomBarSelected == 1 ? 'white' : 'grey'}
        onClick={() => setBottomBarSelected(1)}
        size="2x"
      />
    </Container>
  );
};

export default BottomBar;
