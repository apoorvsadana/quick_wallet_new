import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Provider, useDispatch } from 'react-redux';
import { store } from '../../store/store';
import App from '../../components/App';

const Popup = () => {
  return (
    <Provider store={store}>
      <App></App>
    </Provider>
  );
};

export default Popup;
