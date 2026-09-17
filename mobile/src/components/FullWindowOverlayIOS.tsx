import type { ReactNode } from "react";
import { Platform } from "react-native";
import { FullWindowOverlay } from "react-native-screens";

// react-native-screens (dùng bởi bottom-tabs/native-stack) có thể che khuất
// <Modal> gốc của react-native trên iOS. FullWindowOverlay render trong 1
// UIWindow riêng luôn nổi trên cùng để tránh bug này. Không cần trên Android/web.
export default function FullWindowOverlayIOS({ children }: { children: ReactNode }) {
  if (Platform.OS !== "ios") return <>{children}</>;
  return <FullWindowOverlay>{children}</FullWindowOverlay>;
}
