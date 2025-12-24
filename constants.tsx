
import { MoodType, Intensity, MentalEffort, EnergyLevel, RecommendationMode, Language } from './types';

export const TRANSLATIONS: Record<Language, any> = {
  fa: {
    title: 'Moodflix',
    subtitle: 'سینمای حالِ خوب شما',
    home: 'خانه سینما',
    profile: 'پروفایل من',
    admin: 'پنل مدیریت',
    darkMode: 'حالت تاریک',
    lightMode: 'حالت روشن',
    step1Title: 'الان چه حسی داری؟',
    step1Subtitle: 'شدت و انرژی',
    step1More: 'کمی بیشتر بگو...',
    btnRecommend: 'دریافت پیشنهادات هوشمند',
    loading: 'در حال کشفِ دنیایِ شما...',
    loadingSub: 'هوش مصنوعی ما در حال بررسی هزاران فیلم برای پیدا کردن هماهنگ‌ترین گزینه‌ها با مودِ شماست.',
    tryAgain: 'تغییر مود و تلاش دوباره',
    shareTitle: 'حالِ من امشب:',
    shareReady: 'آماده‌ی استوری کردن!',
    recentHistory: 'تاریخچه اخیر مودها',
    noHistory: 'هنوز پیشنهادی دریافت نکرده‌اید.',
    profileTitle: 'پروفایل احساسی',
    adminStats: 'آمار کل پلتفرم',
    adminUsers: 'مدیریت کاربران',
    adminSettings: 'تنظیمات API هوش مصنوعی',
    totalRequests: 'کل درخواست‌ها',
    aiSuccessRate: 'نرخ موفقیت AI',
    activeUsers: 'کاربران فعال',
    fallbackRate: 'نرخ استفاده از دیتابیس داخلی',
    userName: 'نام کاربر',
    userStatus: 'وضعیت',
    userRole: 'نقش',
    actions: 'عملیات'
  },
  en: {
    title: 'Moodflix',
    subtitle: 'Your Cinema Therapy',
    home: 'Cinema Home',
    profile: 'My Profile',
    admin: 'Admin Panel',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    step1Title: 'How are you feeling?',
    step1Subtitle: 'Intensity & Energy',
    step1More: 'Tell us more...',
    btnRecommend: 'Get Smart Recommendations',
    loading: 'Discovering your world...',
    loadingSub: 'Our AI is scanning thousands of titles to find the perfect match for your mood.',
    tryAgain: 'Change Mood & Retry',
    shareTitle: 'My mood tonight:',
    shareReady: 'Ready for Story!',
    recentHistory: 'Recent Mood History',
    noHistory: 'No recommendations yet.',
    profileTitle: 'Emotional Profile',
    adminStats: 'Platform Analytics',
    adminUsers: 'User Management',
    adminSettings: 'AI API Settings',
    totalRequests: 'Total Requests',
    aiSuccessRate: 'AI Success Rate',
    activeUsers: 'Active Users',
    fallbackRate: 'Internal DB Usage',
    userName: 'User Name',
    userStatus: 'Status',
    userRole: 'Role',
    actions: 'Actions'
  }
};

export const MOODS: any[] = [
  { type: 'happy', labels: { fa: 'خوشحال', en: 'Happy' }, icon: 'M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41M12 7a5 5 0 100 10 5 5 0 000-10z', color: 'text-yellow-500' },
  { type: 'sad', labels: { fa: 'غمگین', en: 'Sad' }, icon: 'M20 17.58A5 5 0 0018 8h-1.26A8 8 0 104 16.25M8 16v.01M8 20v.01M12 18v.01M12 22v.01M16 16v.01M16 20v.01', color: 'text-blue-500' },
  { type: 'calm', labels: { fa: 'آرام', en: 'Calm' }, icon: 'M12 3a6 6 0 009 9 9 9 0 11-9-9z', color: 'text-teal-500' },
  { type: 'anxious', labels: { fa: 'مضطرب', en: 'Anxious' }, icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z', color: 'text-purple-500' },
  { type: 'lonely', labels: { fa: 'تنها', en: 'Lonely' }, icon: 'M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z', color: 'text-indigo-500' },
  { type: 'angry', labels: { fa: 'عصبانی', en: 'Angry' }, icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', color: 'text-red-500' },
  { type: 'empty', labels: { fa: 'خالی', en: 'Empty' }, icon: 'M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-gray-400' },
  { type: 'hopeful', labels: { fa: 'امیدوار', en: 'Hopeful' }, icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z', color: 'text-emerald-500' },
  { type: 'romantic', labels: { fa: 'عاشقانه', en: 'Romantic' }, icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', color: 'text-pink-500' },
  { type: 'couple', labels: { fa: 'زوج‌ها', en: 'Couples' }, icon: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z', color: 'text-rose-600' },
];

export const INTENSITIES: any[] = [
  { value: 'low', labels: { fa: 'کم', en: 'Low' } },
  { value: 'medium', labels: { fa: 'متوسط', en: 'Medium' } },
  { value: 'high', labels: { fa: 'زیاد', en: 'High' } },
];

export const MODES: any[] = [
  { value: 'single', labels: { fa: 'تک پیشنهاد سریع', en: 'Quick Pick' }, descs: { fa: 'یک پیشنهاد متناسب با حال شما', en: 'One tailored recommendation' } },
  { value: 'series', labels: { fa: 'سریال اپیزودیک', en: 'TV Series' }, descs: { fa: 'قسمت‌های کوتاه و حال خوب کن', en: 'Short episodic comfort shows' } },
  { value: 'iranian', labels: { fa: 'سینمای ایران', en: 'Iranian Cinema' }, descs: { fa: 'منتخب آثار ایرانی متناسب با مود', en: 'Curated Iranian titles' } },
  { value: 'mind-bending', labels: { fa: 'ذهن‌فریب', en: 'Mind-Bending' }, descs: { fa: 'فیلم‌های پیچیده و فکری', en: 'Mind-bending & philosophical' } },
  { value: 'nostalgic', labels: { fa: 'سفر نوستالژیک', en: 'Nostalgic Trip' }, descs: { fa: 'آثار کلاسیک و خاطره‌ساز', en: 'Timeless classics' } },
  { value: 'three-options', labels: { fa: '۳ گزینه متفاوت', en: '3 Diverse Options' }, descs: { fa: 'امن، متفاوت، یا عمیق', en: 'Safe, unique, or deep' } },
  { value: 'couples', labels: { fa: 'مودِ دونفره', en: 'Couple Mood' }, descs: { fa: 'مناسب برای تماشا با شریک عاطفی', en: 'Perfect for shared experiences' } },
];
