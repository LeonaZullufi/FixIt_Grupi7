import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../context/themeContext";

const LoadingView = memo(({ message = "Duke ngarkuar të dhënat..." }) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <Text style={{ color: colors.text }}>{message}</Text>
    </View>
  );
});

LoadingView.displayName = "LoadingView";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default LoadingView;
