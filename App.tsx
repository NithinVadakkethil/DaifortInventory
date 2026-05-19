import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { AppNavigator } from './src/navigation/AppNavigator';
import { getDBConnection, createTables, deleteOldOrders } from './src/data/db';
import { seedDatabase } from './src/data/seeder';
import Orientation from 'react-native-orientation-locker';

function App(): React.JSX.Element {
  useEffect(() => {
    let cleanupTimer: ReturnType<typeof setInterval> | undefined;

    const initDB = async () => {
      try {
        const db = await getDBConnection();
        await createTables(db);
        await deleteOldOrders();
        await seedDatabase(db);
        cleanupTimer = setInterval(() => {
          deleteOldOrders().catch((error) => {
            console.error('Failed to clean old orders', error);
          });
        }, 60 * 60 * 1000);
        console.log('Database initialized');
      } catch (e) {
        console.error('Failed to init database', e);
      }
    };
    initDB();

    return () => {
      if (cleanupTimer) {
        clearInterval(cleanupTimer);
      }
    };
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
      <Toast />
    </SafeAreaProvider>
  );
}

export default App;
