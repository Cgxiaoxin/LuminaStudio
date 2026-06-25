/** 小程序文案（默认中文，后续可扩展多语言） */
export const messages = {
  common: {
    brand: 'LuminaStudio',
    loading: '加载中…',
    free: '免费',
    failed: '操作失败',
    cancel: '取消',
    retry: '重试',
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
    loadFailed: '加载失败，请重试',
    domainNotAllowed: '请在开发者工具「详情→本地设置」勾选不校验合法域名',
    networkFailed: '网络请求失败，请确认后端已启动',
    unauthorized: '登录已过期，请重新登录',
    loginRequired: '请先登录后查看',
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
    venue: '场馆',
    profile: '我的',
  },
  home: {
    title: '首页',
    heroSubtitle: '发现课程，轻松预约',
    currentStore: '当前门店',
    selectStore: '选择门店',
    upcomingClasses: '即将开课',
    noUpcoming: '暂无即将开始的课程',
    noUpcomingDesc: '可以先浏览全部课程，选择合适时段预约',
    viewAll: '查看全部',
    spotsLeft: '剩余 {n} 个名额',
    quickActions: '快捷入口',
    browseClasses: '浏览课程',
    myBookings: '我的预约',
    profile: '个人中心',
    buyMembership: '购卡续费',
    goBooking: '去约课',
    bookingStats: '约课统计',
  },
  venue: {
    title: '场馆信息',
    switch: '切换',
    phone: '电话',
    share: '分享',
    shareTitle: '欢迎来体验',
    shareTip: '点击右上角分享给好友',
    defaultHours: '周一至周日 09:00~21:00',
    noAddress: '暂无地址',
    noPhone: '暂无联系电话',
    about: '场馆详情',
    storeName: '场馆名称',
    businessHours: '营业时间',
    addressLabel: '地址',
    phoneLabel: '联系电话',
    linkProfile: '个人中心',
    linkBuyCard: '购卡续费',
    linkStats: '约课统计',
    linkCoaches: '教练团队',
    linkAgreement: '会员协议',
  },
  buyMembership: {
    title: '购卡续费',
    subtitle: '选择适合你的会员卡，在线支付后自动开通',
    empty: '暂无可购会员卡',
    buy: '立即办理',
    paying: '支付中…',
    success: '购卡成功',
    confirmPayTitle: '确认购买',
    confirmPayContent: '即将购买「{name}」，需支付 ¥{price}。确认后将跳转微信支付。',
    confirmPay: '去支付',
    callStore: '联系门店',
    countDetail: '{times} 次 · 有效期 {days} 天',
    durationDetail: '有效期 {days} 天 · 不限次数',
    storedDetail: '储值 ¥{amount}',
  },
  classes: {
    title: '课程',
    scheduleTitle: '课程表',
    listTitle: '全部课程',
    viewSchedule: '课程表',
    viewList: '列表',
    pickDate: '选择日期',
    collapseCalendar: '收起日历',
    selectedDate: '{date}',
    today: '今',
    sessionsAvailable: '共 {n} 节课可约',
    sessionsOnDay: '当日 {n} 节课',
    all: '全部',
    group: '团课',
    private: '私教',
    coachPrefix: '教练：',
    spotsLeft: '剩余 {n} 个名额',
    empty: '暂无可预约课程',
    emptyDesc: '请先在管理后台创建排课，或切换其他门店',
    emptyDay: '今日无排课',
    emptyDayDesc: '试试选择其他日期，或浏览全部课程',
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
    balanceLeft: '储值卡 · 余额 ¥{amount}',
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
    emptyUpcoming: '去课程页挑选一节适合你的课吧',
    emptyHistory: '完成上课后记录会出现在这里',
    canceled: '已取消',
    payNow: '去支付',
    paySuccess: '支付成功',
    payCanceled: '已取消支付',
  },
  profile: {
    title: '我的',
    loginPrompt: '登录后查看个人信息',
    bindPhone: '绑定手机号',
    bindPhoneAction: '微信授权绑定手机号',
    bindPhoneSuccess: '手机号绑定成功',
    myMemberships: '我的会员卡',
    noMemberships: '暂无会员卡',
    unlimitedSessions: '不限次数',
    sessionsLeft: '剩余 {remaining} / {total} 次',
    balanceLeft: '余额 ¥{amount}',
    validUntil: '有效期至 {date}',
    logout: '退出登录',
    totalClasses: '累计上课',
    monthClasses: '本月上课',
    monthAbsences: '本月旷课',
    monthRank: '本月排名',
    rankValue: '第 {n} 名',
    rankEmpty: '暂无',
    menuStats: '约课统计',
    menuHistory: '训练历史',
    menuCoupons: '我的优惠券',
    menuCoaches: '教练团队',
    menuAgreement: '会员协议',
    menuOrders: '我的订单',
    menuProfile: '我的资料',
    viewAllMemberships: '查看全部会员卡',
  },
  profileStats: {
    title: '约课统计',
    summary: '数据概览',
    history: '上课记录',
    empty: '暂无上课记录',
  },
  profileAgreement: {
    title: '会员协议',
    updatedAt: '更新日期：2026-06-20',
    updatedAtDynamic: '更新日期：{date}',
    content: '欢迎使用 LuminaStudio 会员服务。本协议说明会员卡使用规则、有效期、退卡政策及预约须知。预约成功后请按时到场；如需取消请提前联系门店。计次卡按次扣减，期限卡在有效期内不限次数（以门店规则为准），储值卡按课程价格扣费。如有疑问请联系门店前台。',
  },
  profileOrders: {
    title: '我的订单',
    empty: '暂无订单',
    orderNo: '订单号',
    paid: '实付',
    pending: '待支付',
  },
  profileEdit: {
    title: '我的资料',
    nickname: '昵称',
    phone: '手机号',
    memberSince: '注册时间',
    save: '保存资料',
    saved: '资料已保存',
  },
  coaches: {
    title: '教练团队',
    empty: '暂无教练',
    noBio: '暂无简介',
    intro: '教练简介',
  },
  coupons: {
    title: '我的优惠券',
    empty: '暂无优惠券',
    defaultName: '优惠券',
    percentOff: '{n}% 折扣',
    amountOff: '立减 ¥{n}',
    minSpend: '满 ¥{n} 可用',
    status: {
      ACTIVE: '可使用',
      USED: '已使用',
      EXPIRED: '已过期',
      INACTIVE: '已失效',
    },
  },
  profileHistory: {
    title: '训练历史',
    empty: '暂无训练记录',
  },
  orderStatus: {
    PENDING: '待支付',
    PAID: '已支付',
    REFUNDED: '已退款',
    CANCELED: '已取消',
    FAILED: '失败',
  },
  membershipType: {
    COUNT_BASED: '计次卡',
    DURATION_BASED: '期限卡',
    STORED_VALUE: '储值卡',
    HYBRID: '混合卡',
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

export function membershipTypeLabel(type: string): string {
  return (messages.membershipType as Record<string, string>)[type] || type;
}

export function orderStatusLabel(status: string): string {
  return (messages.orderStatus as Record<string, string>)[status] || status;
}
