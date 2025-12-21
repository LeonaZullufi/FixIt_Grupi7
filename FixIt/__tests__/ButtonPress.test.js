import { render, fireEvent } from '@testing-library/react-native';
import Button from '../../components/Button';

test('button reagon ne klik', () => {
  const { getByText } = render(<Button />);
  fireEvent.press(getByText('Dërgo Raportin'));
});
