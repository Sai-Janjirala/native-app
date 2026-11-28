import { SymbolView } from 'expo-symbols';

export function Icon({ ios, android, size = 22, color }) {
  return (
    <SymbolView
      name={{ ios, android, web: ios }}
      tintColor={color}
      size={size}
      style={{ width: size, height: size }}
    />
  );
}
