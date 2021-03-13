import React from 'react';
import { render } from '@testing-library/react';
import App from './App';
import { IState } from './app.interfaces';

test('renders learn react link', () => {

const initialData = document.getElementById('initial-props')!.getAttribute('data-json')!;
const initialProps: IState = JSON.parse(initialData? initialData: '');//parse initial data or empty string
const { getByText } = render(<App {...initialProps}/>);
const linkElement = getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
