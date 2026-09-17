import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import CatalogScreen from "../screens/member/CatalogScreen";
import BookDetailScreen from "../screens/member/BookDetailScreen";
import MyBorrowsScreen from "../screens/member/MyBorrowsScreen";
import ProfileScreen from "../screens/member/ProfileScreen";

export type CatalogStackParamList = {
  CatalogList: undefined;
  BookDetail: { bookId: number };
};

const CatalogStack = createNativeStackNavigator<CatalogStackParamList>();

function CatalogNavigator() {
  return (
    <CatalogStack.Navigator>
      <CatalogStack.Screen name="CatalogList" component={CatalogScreen} options={{ title: "Danh mục sách" }} />
      <CatalogStack.Screen name="BookDetail" component={BookDetailScreen} options={{ title: "Chi tiết sách" }} />
    </CatalogStack.Navigator>
  );
}

export type MemberTabParamList = {
  Catalog: undefined;
  MyBorrows: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MemberTabParamList>();

export default function MemberNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Catalog" component={CatalogNavigator} options={{ title: "Danh mục" }} />
      <Tab.Screen
        name="MyBorrows"
        component={MyBorrowsScreen}
        options={{ title: "Mượn của tôi", headerShown: true }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "Tài khoản", headerShown: true }}
      />
    </Tab.Navigator>
  );
}
