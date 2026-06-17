/** 小程序文案（默认中文，后续可扩展多语言） */
export const messages = {
  common: {
    brand: 'LuminaStudio',
    loading: '加载中…',
    free: '免费',
    failed: '操作失败',
    cancel: '取消',
    coach: '教练',
    price: '价格',
    duration: '时长',
    time: '时间',
    class: '课程',
    user: '用户',
    min: '分钟',
  },
  errors: {
    loginFailed: '登录失败',
    wechatLoginFailed: '微信登录失败',
    domainNotAllowed: '请在开发者工具「详情→本地设置」勾选不校验合法域名',
    networkFailed: '网络请求失败，请确认后端已启动',
    unauthorized: '登录已过期，请重新登录',
  },
  login: {
    title: '登录',
    subtitle: '登录后即可预约课程、管理会员卡',
    submit: '微信一键登录',
    success: '登录成功',
  },
  tab: {
    home: '首页',
    classes: '课程',
    bookings: '预约',
    profile: '我的',
  },
  home: {
    title: '首页',
    selectStore: '选择门店',
    upcomingClasses: '即将开课',
    spotsLeft: '剩余 {n} 个名额',
    quickActions: '快捷入口',
    browseClasses: '浏览课程',
    myBookings: '我的预约',
    profile: '个人中心',
  },
  classes: {
    title: '课程',
    sessionsAvailable: '共 {n} 节课可约',
    all: '全部',
    group: '团课',
    private: '私教',
    coachPrefix: '教练：',
    spotsLeft: '剩余 {n} 个名额',
  },
  classDetail: {
    title: '课程详情',
    groupClass: '团课',
    privateSession: '私教',
    classInfo: '课程信息',
    spotsLeft: '剩余名额',
    description: '课程介绍',
    bookNow: '立即预约',
  },
  bookingConfirm: {
    title: '确认预约',
    summary: '预约信息',
    useMembership: '使用会员卡',
    unlimited: '不限次数',
    sessionsLeft: '剩余 {remaining}/{total} 次',
    freeWithMembership: '免费（使用会员卡）',
    payOnBooking: '预约时支付',
    submitting: '预约中…',
    confirm: '确认预约',
    success: '预约成功',
  },
  bookings: {
    title: '我的预约',
    upcoming: '待上课',
    history: '历史记录',
    membership: '会员卡',
    paid: '已付',
    empty: '暂无预约',
    canceled: '已取消',
  },
  profile: {
    title: '我的',
    loginPrompt: '登录后查看个人信息',
    bindPhone: '绑定手机号',
    myMemberships: '我的会员卡',
    noMemberships: '暂无会员卡',
    unlimitedSessions: '不限次数',
    sessionsLeft: '剩余 {remaining} / {total} 次',
    logout: '退出登录',
  },
  bookingStatus: {
    CREATED: '已创建',
    PENDING_PAYMENT: '待支付',
    CONFIRMED: '已确认',
    CHECKED_IN: '已核销',
    COMPLETED: '已完成',
    CANCELED: '已取消',
  },
  membershipStatus: {
    ACTIVE: '有效',
    EXHAUSTED: '已用完',
    EXPIRED: '已过期',
    CANCELED: '已退卡',
  },
} as const;

function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const value = path.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object' && part in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);
  return typeof value === 'string' ? value : undefined;
}

export function t(key: string, params?: Record<string, string | number>): string {
  let value = getNestedValue(messages as unknown as Record<string, unknown>, key) ?? key;
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      value = value.replace(`{${k}}`, String(v));
    });
  }
  return value;
}

export function bookingStatusLabel(status: string): string {
  return (messages.bookingStatus as Record<string, string>)[status] || status;
}

export function membershipStatusLabel(status: string): string {
  return (messages.membershipStatus as Record<string, string>)[status] || status;
}
