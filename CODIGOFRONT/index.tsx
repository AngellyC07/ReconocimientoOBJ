import React from 'react';
import WelcomeScreen from '../screens/WelcomeScreen';

export default function Index() {
  // Crear navigation falsa para que no dé error
  const fakeNavigation = {
    navigate: () => {},
  };

  return <WelcomeScreen navigation={fakeNavigation} />;
}