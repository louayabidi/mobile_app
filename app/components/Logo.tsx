import { Image, StyleSheet, ImageStyle } from "react-native";

type Props = {
  style?: ImageStyle;
  size?: "small" | "medium" | "large";
};

export default function Logo({ style, size = "medium" }: Props = {}) {
  const sizeStyles = {
    small: { width: 120, height: 70 },
    medium: { width: 180, height: 100 },
    large: { width: 240, height: 130 },
  };

  return (
    <Image
      source={require("../../assets/logo.png")}   // Correct path from components/
      style={[styles.logo, sizeStyles[size], style]}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    alignSelf: "center",
    marginBottom: 20,
  },
});