/* eslint max-len: 0 */
import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

// Children component
class Children extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      name: this.context.name
    };
  }

  render() {
    return(
      <ul>
      <li>
      {`child context is: ${this.context.age}`} // child context is: 18
  </li>
    <li>
    {`state from context: ${this.state.name}`} // state from context: mars
  </li>
    <li>
    {`print age: ${this.context.print(this.context.age)}`} // print age: 18
  </li>
    </ul>
  );
  }
}

Children.contextTypes = {
  name: React.PropTypes.string,
  age: React.PropTypes.number,
  print: React.PropTypes.func
};


// Parent component
class Parent extends React.Component {
  getChildContext() {
    return {
      name: 'mars',
      age: 18
    };
  }

  render() {
    return (
      <div>
      {`from App component xx: ${this.context.name}`} // from App component: bruno
  <div>
    {this.props.children}
  </div>
    </div>
  );
  }
}

Parent.contextTypes = {
  name: React.PropTypes.string
};
Parent.childContextTypes = {
  age: React.PropTypes.number,
  name: React.PropTypes.string
};

// App component
class App extends React.Component {
  getChildContext() {
    return {
      name: 'mars',
      print: (m) => m
    };
  }

  render() {
    return (
      <Parent>
      <Children />
      </Parent>
  );
  }
}

App.childContextTypes = {
  name: React.PropTypes.string,
  print: React.PropTypes.func
};

export default App;
