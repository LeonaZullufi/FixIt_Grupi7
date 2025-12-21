import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
//          Kemi testuar :
//Harta ngarkohet.
//Klikimi mbi Marker funksionon.
//Modali shfaqet me te dhenat e sakta dhe mund te mbyllet.
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({})),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: { email: 'test@user.com' },
  })),
  initializeAuth: jest.fn(() => ({})),
  getReactNativePersistence: jest.fn(() => ({})),
  connectAuthEmulator: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  query: jest.fn(),
  onSnapshot: jest.fn((q, callback) => {
    const fakeSnapshot = {
      docs: [{
        id: '1',
        data: () => ({
          problemTitle: 'Gropë në rrugë',
          description: 'Një gropë e madhe këtu.',
          status: 'pending',
          latitude: 42.6,
          longitude: 20.9,
          userEmail: 'test@user.com',
          photoBase64: ''
        }),
      }],
    };
    callback(fakeSnapshot);
    return jest.fn(); 
  }),
}));

jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(() => ({})),
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('react-native-maps', () => {
  const { View, TouchableOpacity } = require('react-native');
  return {
    __esModule: true,
    default: (props) => <View testID="map-view">{props.children}</View>,
    Marker: (props) => (
      <TouchableOpacity testID="marker" onPress={props.onPress} />
    ),
    PROVIDER_GOOGLE: 'google',
  };
});

import ReportScreen from '../(tabs)/ProblemsScreen';

describe('ReportScreen Tests', () => {
  
  test('shfaqet harta pas loading', async () => {
    const { getByTestId } = render(<ReportScreen />);
    await waitFor(() => expect(getByTestId('map-view')).toBeTruthy());
  });

  test('shfaq modal-in kur klikohet Markeri (Button Press & Modal Visible)', async () => {
    const { getByTestId, queryByText } = render(<ReportScreen />);

    const marker = await waitFor(() => getByTestId('marker'));
    
    fireEvent.press(marker);

    await waitFor(() => {
      expect(queryByText('Gropë në rrugë')).toBeTruthy();
    });
  });

  test('mbyll modal-in kur klikohet butoni Mbyll', async () => {
    const { getByTestId, queryByText, getByText } = render(<ReportScreen />);

    const marker = await waitFor(() => getByTestId('marker'));
    fireEvent.press(marker);

    const closeButton = getByText('Mbyll');
    fireEvent.press(closeButton);

    await waitFor(() => {
      expect(queryByText('Gropë në rrugë')).toBeNull();
    });
  });
});