import React from 'react';
import { StatusBar } from 'react-native';
import { AppNavigator } from '@/navigation';

const App: React.FC = () => {
  return (
    <>
      <StatusBar barStyle="light-content" />
      <AppNavigator />
    </>
  );
};

export default App;
