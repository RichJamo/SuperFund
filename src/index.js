import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import InvestorsDashboard from './pages/InvestorsDashboard';
import ManagersDashboard from './pages/ManagersDashboard';
import './styles/global.css';

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/investors" component={InvestorsDashboard} />
        <Route path="/managers" component={ManagersDashboard} />
      </Switch>
    </Router>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
