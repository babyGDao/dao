import { Web3ReactProvider } from '@web3-react/core';
import Web3NetworkProvider from './components/web3/Web3NetworkProvider';
import Web3ReactManager from './components/web3/Web3RectManager';
import { HashRouter, Route, Routes } from 'react-router-dom';
import getLibrary from './utils/getLibrary';
import Home from './pages/home';
import Ipo from './pages/ipo';
import Wealth from './pages/wealth/wealth';
import Community from './pages/ community/ community';
import Card from './pages/card/card';

function App() {

  return (
    <div className="App ">
      <Web3ReactProvider getLibrary={getLibrary}>
        <Web3ReactManager>
          <Web3NetworkProvider>
            <HashRouter>
              <Routes >
                <Route path="/" element={<Home />} />
                <Route path="/home/:shareAddress?" element={<Home />} />
                <Route path="/ipo" element={<Ipo />} />
                <Route path="/wealth" element={<Wealth />} />
                <Route path="/card" element={<Card />} />
                <Route path="/community" element={<Community />} />
              </Routes>
            </HashRouter>
          </Web3NetworkProvider>
        </Web3ReactManager>
      </Web3ReactProvider>
    </div>
  );
}

export default App;
