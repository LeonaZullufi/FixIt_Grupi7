import React, { memo } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { useTheme } from "../../context/themeContext";

const FormInput = memo(
  ({
    label,
    value,
    onChangeText,
    placeholder,
    error,
    secureTextEntry = false,
    keyboardType = "default",
    autoCapitalize = "sentences",
    editable = true,
    ...props
  }) => {
    const { colors } = useTheme();

    return (
      <View>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {label}
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.card,
              color: colors.text,
              borderColor: colors.border,
            },
            error && styles.inputError,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
          {...props}
        />
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  }
);

FormInput.displayName = "FormInput";

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    marginTop: 16,
    marginBottom: 6,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
  },
  inputError: {
    borderColor: "#dc3545",
  },
  errorText: {
    color: "#dc3545",
    fontSize: 12,
    marginTop: 4,
  },
});

export default FormInput;

export { default as FormInput } from "./FormInput";
export { default as ProfileHeader } from "./ProfileHeader";
export { default as LoadingView } from "./LoadingView";
