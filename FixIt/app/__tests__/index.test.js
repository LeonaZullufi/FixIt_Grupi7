import React from 'react';
import renderer, { act } from 'react-test-renderer';
import Index from '../index';

jest.mock('expo-router', () => ({ useRouter: () => ({ replace: jest.fn() }) }));
jest.mock('../../firebase', () => ({ auth: {}, db: {} }));
jest.mock('firebase/auth', () => ({ onAuthStateChanged: jest.fn(() => jest.fn()) }));
jest.mock('firebase/firestore', () => ({ doc: jest.fn(), getDoc: jest.fn() }));

describe('<Index />', () => {
  it('shfaqet saktë gjatë loading', () => {
    let tree;
    
    act(() => {
      tree = renderer.create(<Index />);
    });

    expect(tree.toJSON()).toMatchSnapshot();
  });
});