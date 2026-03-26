import { Alert, Platform } from 'react-native';

/**
 * Cross-platform alert that works on web (window.confirm/alert) and native (Alert.alert).
 */
export function showAlert(
  title: string,
  message: string,
  onOk?: () => void,
) {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
    onOk?.();
  } else {
    Alert.alert(title, message, [{ text: 'OK', onPress: onOk }]);
  }
}

export function showConfirm(
  title: string,
  message: string,
  onConfirm: () => void,
  confirmText: string = 'OK',
) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) {
      onConfirm();
    }
  } else {
    Alert.alert(title, message, [
      { text: 'Hủy', style: 'cancel' },
      { text: confirmText, onPress: onConfirm },
    ]);
  }
}
