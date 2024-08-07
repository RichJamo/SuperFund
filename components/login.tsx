import { ConnectButton, useActiveAccount } from 'thirdweb/react';
import { client, chain } from '../utils/constants';
import Counter from './counter';

const Login: React.FC = () => {
  console.log('got here');
  const account = useActiveAccount();
  console.log('address', account?.address);
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
      }}
    >
      {account ? (
        <div style={{ textAlign: 'center' }}>
          <ConnectButton client={client} chain={chain} />
          <Counter />
        </div>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <ConnectButton client={client} chain={chain} />
        </div>
      )}
    </div>
  );
};

export default Login;
