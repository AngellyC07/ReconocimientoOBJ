import React from 'react';
import CameraScreen from '../screens/CameraScreen';

export default function Camera() {
  const fakeNavigation = {
    navigate: () => {},
  };

  return <CameraScreen navigation={fakeNavigation} />;
}