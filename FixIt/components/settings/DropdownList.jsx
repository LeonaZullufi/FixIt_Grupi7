import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useTheme } from "../../context/themeContext";

export default function DropdownList({ options = [], selected, onSelect }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.dropdown, { backgroundColor: colors.card }]}>
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          style={[
            styles.dropdownItem,
            selected === option && {
              backgroundColor: colors.tabActive,
              borderRadius: 8,
            },
          ]}
          onPress={() => onSelect(option)}
        >
          <Text
            style={[
              styles.dropdownText,
              { color: colors.text },
              selected === option && {
                color: colors.tabBar,
                fontWeight: "bold",
              },
            ]}
          >
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    borderRadius: 10,
    marginTop: 8,
    paddingVertical: 4,
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  dropdownText: {
    fontSize: 16,
  },
});
