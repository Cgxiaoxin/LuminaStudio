export default defineAppConfig({
  pages: [
    'pages/login/index',
    'pages/home/index',
    'pages/classes/index',
    'pages/class-detail/index',
    'pages/booking-confirm/index',
    'pages/bookings/index',
    'pages/profile/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: 'LuminaStudio',
    navigationBarTextStyle: 'black',
  },
  tabBar: {
    color: '#6f776f',
    selectedColor: '#17211c',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      { pagePath: 'pages/home/index', text: '首页' },
      { pagePath: 'pages/classes/index', text: '课程' },
      { pagePath: 'pages/bookings/index', text: '预约' },
      { pagePath: 'pages/profile/index', text: '我的' },
    ],
  },
});
