import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { getDBConnection, createTables } from './src/data/db';
import { seedDatabase } from './src/data/seeder';

function App(): React.JSX.Element {
  useEffect(() => {
    const initDB = async () => {
      try {
        const db = await getDBConnection();
        await createTables(db);
        await seedDatabase(db);
        console.log('Database initialized');
      } catch (e) {
        console.error('Failed to init database', e);
      }
    };
    initDB();
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
