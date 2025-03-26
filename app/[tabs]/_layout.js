import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "../i18n/useTranslation";

export default function Layout() {
  const { t } = useTranslation();
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#FF914D",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: { backgroundColor: "#fff" },
        tabBarItemStyle: {
          flexDirection: "column",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('navigation.home'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: t('navigation.search'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="fav-list"
        options={{
          title: t('navigation.favorites'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('navigation.settings'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
