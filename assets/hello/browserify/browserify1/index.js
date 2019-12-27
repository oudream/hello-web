// index.js
const StacheElement = require("can-stache-element");

class MyApp extends StacheElement {
  static get view() {
    return `<h1>{{message}}</h1>`;
  }
  
  static get props() {
    return {
      message: "Hello World"
    };
  }
}

customElements.define("my-app", MyApp);
