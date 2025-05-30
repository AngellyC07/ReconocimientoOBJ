import React from 'react';
import MainMenuScreen from '../screens/MainMenuScreen';

export default function MainMenu() {
  // Crear navigation falsa para que no dé error
  const fakeNavigation = {
    navigate: () => {},
  };

  return <MainMenuScreen navigation={fakeNavigation} />;
}