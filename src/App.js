import React, { Component} from 'react';
import { BrowserRouter as Router, Route,Routes} from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Main from './Main';
import Home from './Home';

class App extends Component {
  render() {
    return (
      <Router>
        <Routes>
          <Route path='/' element={<Main />}/>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path='/home' element={<Home />} />
        </Routes>
      </Router>
    );
  }
}
export default App;