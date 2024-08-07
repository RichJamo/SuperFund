import { ConnectButton } from 'thirdweb/react';
import { client, chain } from '../utils/constants';

const Login: React.FC = () => {
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
      <ConnectButton client={client} chain={chain} />
    </div>
  );
};

export default Login;
