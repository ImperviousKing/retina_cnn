import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import { Platform } from "react-native";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  const explicit = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (explicit && explicit.length > 0) return explicit;

  if (Platform.OS === "web" && typeof window !== "undefined") {
    return window.location.origin;
  }

  return "http://localhost:3000";
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
    }),
  ],
});
