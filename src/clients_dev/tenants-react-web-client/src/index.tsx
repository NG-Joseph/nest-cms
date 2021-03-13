import React from 'react';
import ReactDOM from 'react-dom';
//import './index.css';
import App from './App';
import { IState } from './app.interfaces';
import * as serviceWorker from './serviceWorker';

/* For server side rendering support, we need to use hydrate.
We will also get the json data that was written to our server-side template for use here
Of course, this assumes that we have linked the built js clients to the server side template
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
*/

const initialData = document.getElementById('initial-props')!.getAttribute('data-json')!;

//const initialProps: IState = JSON.parse(initialData? decodeURI(initialData): '');//parse initial data or empty string

const initialProps: IState = JSON.parse(decodeURI(initialData));//parse initial data or empty string

ReactDOM.hydrate(<App {...initialProps}/>, document.getElementById('root'));


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
