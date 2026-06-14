export default defineAppConfig({
  pages: ["pages/home/index", "pages/classes/index", "pages/bookings/index", "pages/profile/index"],
  window: {
    backgroundTextStyle: "light",
    navigationBarBackgroundColor: "#ffffff",
    navigationBarTitleText: "LuminaStudio",
    navigationBarTextStyle: "black",
  },
  tabBar: {
    color: "#6f776f",
    selectedColor: "#17211c",
    backgroundColor: "#ffffff",
    borderStyle: "white",
    list: [
      { pagePath: "pages/home/index", text: "Home" },
      { pagePath: "pages/classes/index", text: "Classes" },
      { pagePath: "pages/bookings/index", text: "Bookings" },
      { pagePath: "pages/profile/index", text: "Profile" },
    ],
  },
});
