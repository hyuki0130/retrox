import React from 'react';
import {
  SafeAreaView,
  Text,
  View,
  StyleSheet,
} from 'react-native';

interface AppProps {}

const App: React.FC<AppProps> = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text>Retrox Mobile</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
