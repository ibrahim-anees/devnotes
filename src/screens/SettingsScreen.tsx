import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, List, Switch, Button, Divider } from 'react-native-paper';
import { useTheme } from '../context/ThemeContext';

const SettingsScreen = () => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [soundEnabled, setSoundEnabled] = React.useState(true);

  const handleExportData = () => {
    // TODO: Implement data export
    console.log('Export data');
  };

  const handleImportData = () => {
    // TODO: Implement data import
    console.log('Import data');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
          Settings
        </Text>
      </View>

      <List.Section>
        <List.Subheader>Appearance</List.Subheader>
        <List.Item
          title="Dark Mode"
          right={() => <Switch value={isDarkMode} onValueChange={toggleTheme} />}
        />
        <Divider />
        
        <List.Subheader>Notifications</List.Subheader>
        <List.Item
          title="Enable Notifications"
          right={() => (
            <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} />
          )}
        />
        <List.Item
          title="Sound Effects"
          right={() => <Switch value={soundEnabled} onValueChange={setSoundEnabled} />}
        />
        <Divider />

        <List.Subheader>Data Management</List.Subheader>
        <List.Item
          title="Export Data"
          description="Save your notes and flashcards"
          right={() => <Button onPress={handleExportData}>Export</Button>}
        />
        <List.Item
          title="Import Data"
          description="Restore from backup"
          right={() => <Button onPress={handleImportData}>Import</Button>}
        />
      </List.Section>

      <View style={styles.about}>
        <Text variant="bodySmall" style={styles.version}>
          Dev Notes v1.0.0
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    paddingTop: 60,
  },
  about: {
    padding: 16,
    alignItems: 'center',
  },
  version: {
    color: '#666',
  },
});

export default SettingsScreen;
