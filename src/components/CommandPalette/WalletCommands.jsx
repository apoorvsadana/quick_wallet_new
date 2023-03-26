import { useState } from 'react';
import React from 'react';

const WalletCommands = () => {
  const [open, setOpen] = useState(false);
  React.useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && e.metaKey) {
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);
  console.log('I am inside wallet commands!!!');
  return (
    <input
      id="wallet_commands_id"
      style={{
        position: 'fixed',
        width: '50%',
        backgroundColor: 'white',
        display: open ? 'block' : 'none',
        zIndex: 1000000,
      }}
    ></input>
  );
};

export default WalletCommands;
