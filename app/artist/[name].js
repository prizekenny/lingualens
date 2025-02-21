import { useLocalSearchParams } from "expo-router";
import ArtistScreen from "../screens/ArtistScreen";

export default function Artist() {
  const { name } = useLocalSearchParams();
  return <ArtistScreen artist={name} />;
} 