import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from '../../context/themeContext';
import ContactScreen from '../(tabs)/ContactsHelp'; 

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('../../firebase', () => ({
  auth: {
    currentUser: { uid: 'test-user-123', email: 'test@example.com' },
    onAuthStateChanged: jest.fn((callback) => {
      callback({ uid: 'test-user-123', email: 'test@example.com' });
      return () => {};
    }),
  },
  db: {},
}), { virtual: true });

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(() => Promise.resolve({
    exists: () => true,
    data: () => ({ firstName: 'Filan', lastName: 'Fisteku' })
  })),
  collection: jest.fn(),
  addDoc: jest.fn(),
  serverTimestamp: jest.fn(() => 'mock-timestamp'),
}), { virtual: true });

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    setOptions: jest.fn(),
  }),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

jest.mock('../../components/contacts/AboutAppComponent', () => 'AboutAppComponent');
jest.mock('../../components/contacts/FAQSectionComponent', () => 'FAQSectionComponent');
jest.mock('../../components/contacts/ContactSection', () => 'ContactSection');
jest.mock('../../components/contacts/AppInfo', () => 'AppInfo');

jest.mock('react-native-keyboard-aware-scroll-view', () => {
  const { View } = require('react-native');
  return {
    KeyboardAwareScrollView: View,
  };
});

describe('ContactScreen Snapshot', () => {
  it('renders correctly when user is logged in', async () => {
    let tree;

    await act(async () => {
      tree = renderer.create(
        <NavigationContainer>
          <ThemeProvider>
            <ContactScreen />
          </ThemeProvider>
        </NavigationContainer>
      );
    });

    expect(tree.toJSON()).toMatchSnapshot();
  });
});