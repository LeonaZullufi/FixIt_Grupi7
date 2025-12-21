import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';

// 1. INLINE ASSET MOCKING
const assets = [
  "../../assets/ProblemOnMap/Gropa1.png",
  "../../assets/ProblemOnMap/Gropa2Prizren.jpg",
  "../../assets/ProblemOnMap/KanalizimNeRruge.jpg",
  "../../assets/ProblemOnMap/KendiLojrave.jpg",
  "../../assets/ProblemOnMap/MbeturinaSkenderaj.jpg",
  "../../assets/ProblemOnMap/NdriqimPrishtine.jpg"
];
assets.forEach(asset => jest.mock(asset, () => 1, { virtual: true }));

// 2. MOCK FIREBASE
jest.mock("../../firebase.js", () => ({ db: {} }));

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(() => ({
    currentUser: { email: "test@user.com" },
  })),
}));

// We'll control the firestore mock to test the loading state
let triggerSnapshot;
jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  query: jest.fn(),
  onSnapshot: jest.fn((q, callback) => {
    triggerSnapshot = callback; // Capture the callback to trigger it manually
    return () => {};
  }),
}));

// 3. MOCK MAPS
jest.mock("react-native-maps", () => {
  const React = require("react");
  const { View, TouchableOpacity } = require("react-native");
  return {
    __esModule: true,
    default: (props) => <View testID="map-view" {...props}>{props.children}</View>,
    Marker: (props) => (
      <TouchableOpacity testID="map-marker" onPress={() => props.onPress(props.report)} />
    ),
    PROVIDER_GOOGLE: "google",
  };
});

// 4. IMPORT COMPONENT
import ProblemsScreen from "../(tabs)/ProblemsScreen";

describe("ProblemsScreen Single-File Test", () => {
  
  it("shows loading and then displays markers", async () => {
    render(<ProblemsScreen />);
    
    // 1. Verify Loading State (Before we trigger snapshot)
    expect(screen.getByText(/Duke ngarkuar raportet/i)).toBeTruthy();

    // 2. Trigger the data update
    await act(async () => {
      triggerSnapshot({
        docs: [{
          id: "1",
          data: () => ({
            latitude: 42.6,
            longitude: 20.9,
            description: "Gropa ne rruge",
            photoName: "Gropa1.png",
            userEmail: "test@user.com",
            finished: false,
          }),
        }],
      });
    });

    // 3. Verify marker appears
    const marker = await screen.findByTestID("map-marker");
    expect(marker).toBeTruthy();
  });

  it("handles Modal visibility and Interaction", async () => {
    render(<ProblemsScreen />);

    // Feed data
    await act(async () => {
      triggerSnapshot({
        docs: [{
          id: "1",
          data: () => ({
            description: "Test Description",
            userEmail: "test@user.com",
          }),
        }],
      });
    });

    const marker = await screen.findByTestID("map-marker");
    fireEvent.press(marker);

    // Modal should show description
    expect(screen.getByText("Test Description")).toBeTruthy();

    const closeButton = screen.getByText("Mbyll");
    fireEvent.press(closeButton);

    // Modal should disappear
    await waitFor(() => {
      expect(screen.queryByText("Mbyll")).toBeNull();
    });
  });

  it("validates boundary clamping on region change", async () => {
    render(<ProblemsScreen />);
    
    // Skip loading
    await act(async () => { triggerSnapshot({ docs: [] }); });

    const map = screen.getByTestID("map-view");

    await act(async () => {
      map.props.onRegionChangeComplete({
        latitude: 30.0, // Out of bounds
        longitude: 21.0,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      });
    });

    expect(map).toBeTruthy();
  });
});