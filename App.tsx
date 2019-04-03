import React, { Component } from 'react';
import Game from './src/app';

export default class App extends Component<{}, {}> {
  public render(): JSX.Element {
    return (
      <Game />
    );
  }
}
