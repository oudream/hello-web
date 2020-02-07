import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';

import App from './components/App';


const renderApp = () => {
  ReactDOM.render(
    <AppContainer>
      <App title='title1'/>
    </AppContainer>, document.querySelector('#root'));
};

if (module.hot) {
  module.hot.accept('./app', renderApp);
}

renderApp();
