import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ContactScreen from '../(tabs)/ContactsHelp'; 
import { Alert } from 'react-native';
// bojeni kete per t'i printuar infromata rreth testeve:  npm test -- --verbose

jest.mock("../../components/contacts/AboutAppComponent", () => {
  const { Text } = require('react-native');
  return () => <Text>AboutAppComponent Mock</Text>;
});
jest.mock("../../components/contacts/FAQSectionComponent", () => {
  const { Text } = require('react-native');
  return () => <Text>FAQSectionComponent Mock</Text>;
});
jest.mock("../../components/contacts/ContactSection", () => {
  const { Text } = require('react-native');
  return () => <Text>ContactSection Mock</Text>;
});
jest.mock("../../components/contacts/AppInfo", () => {
  const { Text } = require('react-native');
  return () => <Text>AppInfo Mock</Text>;
});


jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ setOptions: jest.fn() }),
}));

jest.mock('react-native-keyboard-aware-scroll-view', () => ({
  KeyboardAwareScrollView: ({ children }) => children,
}));

jest.mock('../../context/themeContext', () => ({
  useTheme: () => ({
    colors: { background: '#fff', text: '#000', border: '#ccc', card: '#eee', textSecondary: '#666', tabBar: '#000' },
    theme: 'light'
  }),
}));


jest.mock('../../firebase', () => ({
  auth: {
    currentUser: null,
    onAuthStateChanged: jest.fn((cb) => cb(null)),
  },
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  collection: jest.fn(),
  addDoc: jest.fn(() => Promise.resolve({ id: '123' })),
  serverTimestamp: jest.fn(),
}));


const spyOnAlert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

describe('ContactScreen Testing', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shfaq gabime kur fushata lihen bosh dhe shtypet dërgimi', async () => {
    const { getByText } = render(<ContactScreen />);
    
    const submitButton = getByText('Dërgo Mesazhin');
    fireEvent.press(submitButton);

    expect(spyOnAlert).toHaveBeenCalledWith(
      "Gabime në Formular",
      expect.stringContaining("Mesazhi duhet të ketë të paktën 6 karaktere.")
    );
  });

  it('lejon plotësimin e fushave dhe dërgimin me sukses', async () => {
    const { getByPlaceholderText, getByText } = render(<ContactScreen />);

    fireEvent.changeText(getByPlaceholderText('Emri'), 'Filan');
    fireEvent.changeText(getByPlaceholderText('Mbiemri'), 'Fisteku');
    fireEvent.changeText(getByPlaceholderText('Email'), 'filan@test.com');
    fireEvent.changeText(getByPlaceholderText('Mesazhi (min. 6 karaktere)'), 'Ky është një mesazh testues.');

    const submitButton = getByText('Dërgo Mesazhin');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(spyOnAlert).toHaveBeenCalledWith(
        "Sukses!",
        expect.stringContaining("Mesazhi juaj u dërgua me sukses")
      );
    });
  });
});