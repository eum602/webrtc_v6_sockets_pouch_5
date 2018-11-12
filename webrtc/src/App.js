import React, { Component } from 'react'
import Mean from './pages/index'
import {BrowserRouter , Route} from 'react-router-dom'
import ClientMineBlock from './pages/ClientMineBlock'
import CreateTransaction from './pages/CreateTransaction';
class App extends Component {
  state = {
    
  }

  renderContent = () => {
    return(
      <div>
        <Route exact path = "/operations/mineBlock" component = {props =>
          <ClientMineBlock {...props} notes = {'a'} />}>
        </Route>

        <Route exact path = "/operations/createTransaction" component = {props =>
          <CreateTransaction/>}>
        </Route>

      </div>
    )
  }
  render() {
    return (
      <BrowserRouter>
        <div>
          <Mean/>
          {this.renderContent()}
        </div>
      </BrowserRouter>
          
    )
  }
}

export default App