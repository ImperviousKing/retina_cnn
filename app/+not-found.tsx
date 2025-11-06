import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Oops!" }} />
      
      <LinearGradient
        colors={[Colors.primary.purple, Colors.primary.teal, Colors.primary.green]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      
      <View style={styles.content}>
        <Text style={styles.title}>404</Text>
        <Text style={styles.subtitle}>This screen doesn&apos;t exist.</Text>

        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go to Home</Text>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 72,
    fontWeight: "800" as const,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: Colors.text.primary,
    opacity: 0.9,
    marginBottom: 32,
  },
  link: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  linkText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text.primary,
  },
});
