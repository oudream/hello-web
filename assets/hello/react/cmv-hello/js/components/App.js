/* eslint max-len: 0 */
import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

class TestPanelA extends React.Component {

  static propTypes = {
    title: PropTypes.string
  };

  static defaultProps = {};

  render() {
    return (
      <div>

      </div>
    )
  }
}

class App extends React.Component {

  static propTypes = {
    title: PropTypes.string
  };

  static defaultProps = {};

  static iCount = 0;

  constructor(props) {
    super(props);
    this.state = {
      name: 'a',
      i: 11
    };
    this.click1 = this.click1.bind(this);
  }

  click1() {
    this.setState({
      i: 12
    });
    console.log(this.state);
  }

  render() {
    App.iCount++;
    let ref = c => {
      const input = ReactDOM.findDOMNode(c);
      console.log('ref--->');
      console.log(c);
      console.log(input);
      console.log(App.iCount);
      if (c === null) return;
      console.log('toFixed :' + (App.iCount % 5).toFixed().toString());
      switch (Number((App.iCount % 5).toFixed())) {
      case 0:
        c.style.backgroundColor = 'red';
        break;
      case 1:
        c.style.backgroundColor = 'blue';
        break;
      case 2:
        c.style.backgroundColor = 'yellow';
        break;
      default:
        c.style.backgroundColor = 'green';
        break;
      }
    };

    return (
      <div ref={ref} onClick={this.click1}>
        <p>Hello 你这傻子，疯子</p>
      </div>
    );
  }
}

export default App;
