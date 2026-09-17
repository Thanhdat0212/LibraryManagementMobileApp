import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import DashboardScreen from "../screens/admin/DashboardScreen";
import BooksScreen from "../screens/admin/BooksScreen";
import BookCopiesScreen from "../screens/admin/BookCopiesScreen";
import BorrowRecordsScreen from "../screens/admin/BorrowRecordsScreen";
import CatalogManagementScreen from "../screens/admin/CatalogManagementScreen";
import AccountScreen from "../screens/admin/AccountScreen";

export type BooksStackParamList = {
  BooksList: undefined;
  BookCopies: { bookId: number; bookTitle: string };
};

const BooksStack = createNativeStackNavigator<BooksStackParamList>();

function BooksNavigator() {
  return (
    <BooksStack.Navigator>
      <BooksStack.Screen name="BooksList" component={BooksScreen} options={{ title: "Quản lý sách" }} />
      <BooksStack.Screen
        name="BookCopies"
        component={BookCopiesScreen}
        options={({ route }) => ({ title: route.params.bookTitle })}
      />
    </BooksStack.Navigator>
  );
}

export type AdminTabParamList = {
  Dashboard: undefined;
  Books: undefined;
  BorrowRecords: undefined;
  CatalogManagement: undefined;
  Account: undefined;
};

const Tab = createBottomTabNavigator<AdminTabParamList>();

export default function AdminNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: true }}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: "Tổng quan" }} />
      <Tab.Screen name="Books" component={BooksNavigator} options={{ title: "Sách", headerShown: false }} />
      <Tab.Screen name="BorrowRecords" component={BorrowRecordsScreen} options={{ title: "Mượn trả" }} />
      <Tab.Screen
        name="CatalogManagement"
        component={CatalogManagementScreen}
        options={{ title: "Danh mục" }}
      />
      <Tab.Screen name="Account" component={AccountScreen} options={{ title: "Tài khoản" }} />
    </Tab.Navigator>
  );
}
