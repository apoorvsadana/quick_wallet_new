import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { selectWallet } from '../../features/wallet/walletSlice';
import config from '../../config/config.json';
import walletLogo from '../../assets/img/wallet_logo.png';
import Select from 'react-select';

const NavbarContainer = styled.div`
  background-color: #222222;
  border-bottom: 1px solid #3a3a3a;
  height: ${config.navbarHeight + 'px'};
  position: absolute;
  top: 0;
  width: 96%;
  color: white;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding-left: 2%;
  padding-right: 2%;
`;

const WalletContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const WalletImage = styled.img`
  width: 25px;
`;

const WalletAddress = styled.div`
  font-size: 1rem;
  margin-left: 5%;
`;

const Network = styled.div`
  background-color: #272727;
  border-radius: 1px solid #3a3a3a;
  text-align: center;
  width: 20%;
  padding-bottom: 8px;
  padding-top: 8px;
  border-radius: 50px;
  border: 1px solid #3a3a3a;
`;

const Navbar = () => {
  const wallet = useSelector(selectWallet);
  const pk = wallet.privateKey;
  return (
    <NavbarContainer>
      <WalletContainer>
        <WalletImage src={walletLogo}></WalletImage>
        <WalletAddress>
          {pk
            ? pk.substring(0, 6) +
              '...' +
              pk.substring(pk.length - 4, pk.length)
            : ''}
        </WalletAddress>
      </WalletContainer>
      <Network>Polygon</Network>
    </NavbarContainer>
  );
};

export default Navbar;
