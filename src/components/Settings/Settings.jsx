import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import styled, { css } from 'styled-components';
import Toggle from 'react-toggle';
import './Settings.css';

const SettingsContainer = styled.div`
  padding-left: 1rem;
  height: -webkit-fill-available;
  padding-top: 1rem;
  padding-right: 1rem;
  padding-bottom: 1rem;
  overflow: hidden;
  padding-left: 2%;
  padding-top: 2%;
`;

const Heading = styled.div`
  font-size: 4vh;
  color: white;
  text-align: left;
  margin-bottom: 2%;
  @media (min-width: 900px) {
    font-size: 3vh;
  }
`;

const SettingRow = styled.div`
  justify-content: space-between;
  display: flex;
  margin-bottom: 1%;
`;

const SettingName = styled.div`
  color: #bdbdbd;
  font-size: 3vh;
  @media (min-width: 900px) {
    font-size: 2vh;
  }
`;

const Settings = () => {
  const [settings, setSettings] = useState({
    debugger: false,
    autoSubmit: false,
    hotkeys: false,
  });
  useEffect(() => {
    (async () => {
      let settingsStorage = await chrome.storage.sync.get(['settings']);
      console.log('got settings from storage - ', settingsStorage);
      if (!settingsStorage.settings) {
        settingsStorage = {
          debugger: true,
          autoSubmit: true,
          hotkeys: true,
        };
        await chrome.storage.sync.set({
          settings: settingsStorage,
        });
        return;
      }
      setSettings(settingsStorage.settings);
    })();
  }, []);

  const updateSettings = async (e, keyName) => {
    console.log('inside upate settings', e.target.checked, keyName);
    let newSettings = { ...settings };
    newSettings[keyName] = e.target.checked;
    setSettings(newSettings);
    await chrome.storage.sync.set({
      settings: newSettings,
    });
  };
  return (
    <SettingsContainer>
      <Heading>Settings</Heading>
      <SettingRow>
        <SettingName>Debugger</SettingName>
        <label>
          <Toggle
            checked={settings.debugger}
            icons={false}
            onChange={(e) => {
              console.log('inside over here!!!');
              updateSettings(e, 'debugger');
            }}
          />
        </label>
      </SettingRow>
      <SettingRow>
        <SettingName>Auto Submit Transactions</SettingName>
        <label>
          <Toggle
            checked={settings.autoSubmit}
            icons={false}
            onChange={(e) => {
              updateSettings(e, 'autoSubmit');
            }}
          />
        </label>
      </SettingRow>
      <SettingRow>
        <SettingName>Hotkeys</SettingName>
        <label>
          <Toggle
            checked={settings.hotkeys}
            icons={false}
            onChange={(e) => {
              updateSettings(e, 'hotkeys');
            }}
          />
        </label>
      </SettingRow>
    </SettingsContainer>
  );
};

export default Settings;
