
import { MovieRecommendation, RecommendationResponse, UserMoodInput, Language } from "../types";

const LOCAL_DATA: Record<Language, Record<string, MovieRecommendation[]>> = {
  fa: {
    happy: [
      {
        title: "مارمولک (The Lizard)",
        mediaType: "movie",
        explanation: "یک کمدی انسانی که با نگاهی متفاوت به مذهب و اخلاق، لبخند را به لبان شما می‌آورد.",
        summary: "یک دزد سابقه‌دار برای فرار از زندان ملبس به لباس روحانیت می‌شود و با چالش‌های غیرمنتظره‌ای روبرو می‌گردد.",
        whyFits: "طنز هوشمندانه و پیام صلح‌آمیز فیلم برای تقویت روحیه عالی است.",
        suggestedTime: "جمعه عصر با خانواده",
        genre: ["کمدی", "اجتماعی"],
        emotionalOutcome: "خنده و رهایی",
        country: "Iran",
        imdbScore: 8.4,
        posterUrl: "https://m.media-amazon.com/images/M/MV5BMjA5MjYwMzYtMmY4Zi00YmU3LThhM2UtYzg1YjVlMWU1YzVkXkEyXkFqcGdeQXVyNTMxMTY2OTU@._V1_.jpg"
      }
    ],
    sad: [
      {
        title: "جدایی نادر از سیمین (A Separation)",
        mediaType: "movie",
        explanation: "تحلیلی دقیق از فروپاشی یک رابطه و چالش‌های اخلاقی در جامعه مدرن ایران.",
        summary: "زن و شوهری در آستانه جدایی با بحرانی بزرگتر مواجه می‌شوند که پای خانواده‌ای دیگر را به میان می‌کشد.",
        whyFits: "اگر نیاز به تفکر عمیق و همذات‌پنداری با دردهای انسانی دارید، این فیلم بی‌نظیر است.",
        suggestedTime: "نیمه‌شب در تنهایی",
        genre: ["درام", "معمایی"],
        emotionalOutcome: "تخلیه روانی و تامل",
        country: "Iran",
        imdbScore: 8.3,
        posterUrl: "https://m.media-amazon.com/images/M/MV5BZDRiZGFjNmItZDA5MS00YjVlLTk0OWUtZTE3NzhjMjI4OTYxXkEyXkFqcGdeQXVyMjUzOTY1NTc@._V1_.jpg"
      }
    ],
    calm: [
      {
        title: "طعم گیلاس (Taste of Cherry)",
        mediaType: "movie",
        explanation: "شاهکاری از عباس کیارستمی که شما را به آرامش و ستایش زندگی دعوت می‌کند.",
        summary: "مردی در حاشیه شهر تهران به دنبال کسی می‌گردد که پس از خودکشی‌اش روی او خاک بریزد.",
        whyFits: "ریتم کند و مناظر بصری فیلم مانند یک مدیتیشن تصویری است.",
        suggestedTime: "بعد از یک روز پرمشغله",
        genre: ["درام", "مینیمال"],
        emotionalOutcome: "صلح با خود",
        country: "Iran",
        imdbScore: 7.7,
        posterUrl: "https://m.media-amazon.com/images/M/MV5BMTY3NTUxNTYxMF5BMl5BanBnXkFtZTcwNTI2Mzc3NA@@._V1_.jpg"
      }
    ],
    anxious: [
      {
        title: "درباره الی (About Elly)",
        mediaType: "movie",
        explanation: "یک تریلر روانشناختی که تعلیق و اضطراب ناشی از پنهان‌کاری را به خوبی به تصویر می‌کشد.",
        summary: "گروهی از دوستان برای تعطیلات به شمال می‌روند، اما ناپدید شدن یکی از آن‌ها، جو سفر را به شدت متشنج می‌کند.",
        whyFits: "فضای پرتعلیق فیلم با مود اضطراب همخوانی دارد و ذهن را به چالش می‌کشد.",
        suggestedTime: "عصر یک روز تعطیل",
        genre: ["درام", "معمایی", "تریلر"],
        emotionalOutcome: "هیجان و تخلیه استرس",
        country: "Iran",
        imdbScore: 7.9,
        posterUrl: "https://m.media-amazon.com/images/M/MV5BNmU5NmU1MGQtY2QxNy00YmU0LWFhM2YtMzc2YzI4MjU5ZDU4XkEyXkFqcGdeQXVyMjUzOTY1NTc@._V1_.jpg"
      }
    ],
    angry: [
      {
        title: "لانتوری (Lantouri)",
        mediaType: "movie",
        explanation: "تصویری عریان از خشم، انتقام و تبعات ناشی از عقده‌های اجتماعی در جامعه معاصر.",
        summary: "داستان یک گروه بزهکار به نام لانتوری و عشقی که به یک تراژدی هولناک و انتقامی سخت ختم می‌شود.",
        whyFits: "برای کسانی که نیاز دارند خشم خود را در قالب یک روایت اجتماعی سنگین تخلیه کنند.",
        suggestedTime: "زمانی که نیاز به تخلیه هیجانی دارید",
        genre: ["درام", "جنایی", "اجتماعی"],
        emotionalOutcome: "آگاهی و تخلیه خشم",
        country: "Iran",
        imdbScore: 6.2,
        posterUrl: "https://m.media-amazon.com/images/M/MV5BMGUyMGE2Y2MtZjU1Ni00NTI3LWE0NzYtYjA4ZTc1Njk2MTNhXkEyXkFqcGdeQXVyNTMxMTY2OTU@._V1_.jpg"
      }
    ],
    lonely: [
      {
        title: "پله آخر (The Last Step)",
        mediaType: "movie",
        explanation: "روایتی غیرخطی و متفاوت از تنهایی، فقدان و خاطراتی که دست از سر آدم برنمی‌دارند.",
        summary: "لیلی هنرپیشه‌ای است که در جریان فیلمبرداری دچار بحران می‌شود و خاطرات همسر درگذشته‌اش او را رها نمی‌کند.",
        whyFits: "فضای مالیخولیایی و خلوت فیلم برای لحظات تنهایی بسیار همذات‌پندارانه است.",
        suggestedTime: "اواخر شب در سکوت",
        genre: ["درام", "عاشقانه"],
        emotionalOutcome: "پذیرش تنهایی و آرامش",
        country: "Iran",
        imdbScore: 6.7,
        posterUrl: "https://m.media-amazon.com/images/M/MV5BNDM1NjE2NTMtZjVkZi00YmU3LWJjOTQtNzNmNTA1MWViYjljXkEyXkFqcGdeQXVyMjUzOTY1NTc@._V1_.jpg"
      }
    ],
    romantic: [
      {
        title: "شب‌های روشن (White Nights)",
        mediaType: "movie",
        explanation: "اقتباسی آزاد از داستایوفسکی که عاشقانه‌ای فیلسوفانه در دل خیابان‌های تهران است.",
        summary: "داستان دو غریبه که در چهار شب پاییزی، تنهایی و عشق را در گفتگوهای شبانه جستجو می‌کنند.",
        whyFits: "برای مودهای رمانتیک که به دنبال عمق و فضای شاعرانه هستند.",
        suggestedTime: "یک شب بارانی در خانه",
        genre: ["عاشقانه", "درام"],
        emotionalOutcome: "احساس شاعرانه و عشق",
        country: "Iran",
        imdbScore: 7.8,
        posterUrl: "https://m.media-amazon.com/images/M/MV5BYzA2YzY0MTMtY2Y2MS00NGEwLWE3NzAtY2I5NjNlZjVlYjU4XkEyXkFqcGdeQXVyMjUzOTY1NTc@._V1_.jpg"
      }
    ],
    couple: [
      {
        title: "درخت گلابی (The Pear Tree)",
        mediaType: "movie",
        explanation: "سفری به خاطرات دوران بلوغ و عشقی که هیچ‌وقت از ذهن پاک نمی‌شود.",
        summary: "نویسنده‌ای برای نوشتن کتاب جدیدش به باغ قدیمی پدری‌اش می‌رود و غرق در خاطرات عشق دوران کودکی‌اش می‌شود.",
        whyFits: "مناسب برای زوج‌هایی که دوست دارند درباره گذشته و ریشه‌های عشق گفتگو کنند.",
        suggestedTime: "شب‌های آرام دو نفره",
        genre: ["عاشقانه", "درام"],
        emotionalOutcome: "نوستالژی و پیوند عمیق",
        country: "Iran",
        imdbScore: 7.4,
        posterUrl: "https://m.media-amazon.com/images/M/MV5BMTkxMDUwNjY4Ml5BMl5BanBnXkFtZTcwOTgyMTM1MQ@@._V1_.jpg"
      }
    ],
    iranian: [
      {
        title: "فروشنده (The Salesman)",
        mediaType: "movie",
        explanation: "چالشی بزرگ برای سنجش اخلاق، غیرت و بخشش در بستر یک حادثه ناگوار.",
        summary: "پس از تعرض به یک زن در خانه‌اش، همسرش در جستجوی انتقام وارد مسیری تاریک می‌شود.",
        whyFits: "سینمای اصغر فرهادی در بهترین فرم خود برای تحلیل روابط.",
        suggestedTime: "یک شب سرد پاییزی",
        genre: ["معمایی", "درام"],
        emotionalOutcome: "تمرکز و تحلیل",
        country: "Iran",
        imdbScore: 7.7,
        posterUrl: "https://m.media-amazon.com/images/M/MV5BOGZlZDdmMWItYmI1OS00NDNjLTg3N2UtMGIwZGUwODlkMjFhXkEyXkFqcGdeQXVyMjUzOTY1NTc@._V1_.jpg"
      }
    ]
  },
  en: {
    happy: [
      {
        title: "The Intouchables",
        mediaType: "movie",
        explanation: "A heartwarming story based on a real friendship that proves joy can be found in the most unlikely circumstances.",
        summary: "A wealthy aristocrat who becomes a quadriplegic following a paragliding accident hires a young man from the projects to be his caregiver.",
        whyFits: "Its life-affirming energy and genuine humor are perfect for a happy mood.",
        suggestedTime: "Weekend afternoon",
        genre: ["Comedy", "Drama", "Biography"],
        emotionalOutcome: "Pure Joy and Optimism",
        country: "France",
        imdbScore: 8.5,
        posterUrl: "https://m.media-amazon.com/images/M/MV5BMTYxNDA3MDQwNl5BMl5BanBnXkFtZTcwNTU4Mzc1Nw@@._V1_.jpg"
      }
    ],
    sad: [
      {
        title: "Manchester by the Sea",
        mediaType: "movie",
        explanation: "A profound exploration of grief and the complexities of familial bonds.",
        summary: "A depressed uncle is asked to take care of his teenage nephew after the boy's father dies.",
        whyFits: "The raw emotional honesty of the film provides a space for reflection and catharsis.",
        suggestedTime: "Late night alone",
        genre: ["Drama"],
        emotionalOutcome: "Deep Reflection and Release",
        country: "USA",
        imdbScore: 7.8,
        posterUrl: "https://m.media-amazon.com/images/M/MV5BMTYxMjk0NDg4Ml5BMl5BanBnXkFtZTgwOTEyMTkzMDI@._V1_.jpg"
      }
    ],
    calm: [
      {
        title: "Paterson",
        mediaType: "movie",
        explanation: "A quiet celebration of the poetry found in the routine of daily life.",
        summary: "The story follows the daily life of a bus driver and poet in Paterson, New Jersey.",
        whyFits: "The slow rhythm and peaceful atmosphere act as a visual meditation.",
        suggestedTime: "After a long day",
        genre: ["Drama", "Romance"],
        emotionalOutcome: "Inner Peace",
        country: "USA",
        imdbScore: 7.4,
        posterUrl: "https://m.media-amazon.com/images/M/MV5BMTYyOTkwOTY2Ml5BMl5BanBnXkFtZTgwNjYzNzg0OTE@._V1_.jpg"
      }
    ],
    romantic: [
      {
        title: "Before Sunrise",
        mediaType: "movie",
        explanation: "A masterpiece of conversational romance that captures the magic of a brief connection.",
        summary: "A young man and woman meet on a train in Europe, and wind up spending one evening together in Vienna.",
        whyFits: "Perfect for a romantic mood that appreciates intellectual and emotional depth.",
        suggestedTime: "A cozy evening with a loved one",
        genre: ["Romance", "Drama"],
        emotionalOutcome: "Enchantment and Hope",
        country: "USA",
        imdbScore: 8.1,
        posterUrl: "https://m.media-amazon.com/images/M/MV5BZDdiZTAwYzAtMDI3Ni00OTY5LThjMTEtNmUxOWU3ZDBlMmY0XkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg"
      }
    ],
    couple: [
      {
        title: "About Time",
        mediaType: "movie",
        explanation: "A beautiful reminder that true love is found in the small, ordinary moments of everyday life.",
        summary: "At the age of 21, Tim discovers he can travel in time and change what happens and has happened in his own life.",
        whyFits: "A warm and touching film that emphasizes the value of shared time and experiences.",
        suggestedTime: "Date night at home",
        genre: ["Fantasy", "Romance", "Drama"],
        emotionalOutcome: "Gratitude and Bond Strengthening",
        country: "UK",
        imdbScore: 7.8,
        posterUrl: "https://m.media-amazon.com/images/M/MV5BMTA1ODUzMDA3NzFeQTJeQWpwZ15BbWU3MDgxMTYxMjk@._V1_.jpg"
      }
    ],
    iranian: [
      {
        title: "Where is the Friend's House?",
        mediaType: "movie",
        explanation: "A poetic journey about childhood integrity and the simple power of kindness.",
        summary: "An eight-year-old boy must return his friend's notebook he took by mistake, lest his friend be expelled.",
        whyFits: "A gentle film that touches the soul with its simplicity and purity.",
        suggestedTime: "Quiet Sunday morning",
        genre: ["Adventure", "Drama"],
        emotionalOutcome: "Gentle Heart-Warming",
        country: "Iran",
        imdbScore: 8.1,
        posterUrl: "https://m.media-amazon.com/images/M/MV5BOGY4MjI4NWQtZjc0Mi00ZWMxLWEyZTMtM2UxZjk0YWU2YmU5XkEyXkFqcGdeQXVyMjUzOTY1NTc@._V1_.jpg"
      }
    ]
  }
};

export const getLocalRecommendations = (input: UserMoodInput): RecommendationResponse => {
  const lang = input.language || 'fa';
  const db = LOCAL_DATA[lang];
  
  const modeKey = input.mode === 'iranian' ? 'iranian' : input.primaryMood;
  const recommendations = db[modeKey] || db.calm;

  return {
    recommendations,
    emotionalMessage: lang === 'fa' 
      ? "در حال حاضر از آرشیو منتخب ما برای شما انتخاب کردیم." 
      : "Selected from our curated archive for your current mood.",
    packTheme: lang === 'fa' ? "برگزیده‌های آفلاین" : "Offline Highlights"
  };
};
