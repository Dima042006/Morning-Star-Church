// ─────────────────────────────────────────────────────────────
//  Увесь контент сайту — тут. Змінюйте тексти, дати й посилання
//  в цьому файлі, код компонентів чіпати не потрібно.
//  Фото: покладіть файл у src/assets/images, імпортуйте його
//  вгорі цього файлу (import myImg from './assets/images/my.jpg')
//  і впишіть у потрібне поле: image: myImg. Якщо image: null —
//  показується акуратна заглушка.
// ─────────────────────────────────────────────────────────────

import hallImg from './assets/images/hall.jpg';
import streamImg from './assets/images/stream.jpg';
import record1Img from './assets/images/record-1.jpg';
import record2Img from './assets/images/record-2.jpg';
import record3Img from './assets/images/record-3.jpg';
import schoolImg from './assets/images/sunday-school.jpg';
import harvestImg from './assets/images/harvest.jpg';
import youthImg from './assets/images/youth.jpg';
import baptismImg from './assets/images/baptism.jpg';

export const church = {
  name: 'Світанкова Зоря',
  full: 'Церква християн віри євангельської',
  union: 'УЦХВЄ',
  city: 'Рівне',
  address: 'вул. Євгена Плужника, 3, Рівне',
  postal: '33017',
  mapUrl: 'https://www.google.com/maps/search/?api=1&query=%D0%B2%D1%83%D0%BB.+%D0%84%D0%B2%D0%B3%D0%B5%D0%BD%D0%B0+%D0%9F%D0%BB%D1%83%D0%B6%D0%BD%D0%B8%D0%BA%D0%B0%2C+3%2C+%D0%A0%D1%96%D0%B2%D0%BD%D0%B5',
  // ⚠ телефон взято з довідника 2pos.in.ua — перевірте перед публікацією
  phone: '+380 68 046 2971',
  email: 'svitankovazorya@gmail.com',
  // Недільні богослужіння: від них рахується таймер і стан «Наживо»
  services: [
    { weekday: 0, hour: 10, minute: 0, durationMin: 120 },
    { weekday: 0, hour: 18, minute: 0, durationMin: 120 },
  ],
  youtube: 'https://www.youtube.com/channel/UCFhEhiIQp2THnSjOVhTYRUg',
  facebook: 'https://www.facebook.com/profile.php?id=2016910998588915',
  instagramYouth: 'https://www.instagram.com/svitankova_youth/',
  iban: 'UA00 0000 0000 0000 0000 0000 000',
};

export const nav = [
  { id: 'top', label: 'Головна' },
  { id: 'stream', label: 'Трансляції' },
  { id: 'schedule', label: 'Розклад' },
  { id: 'first-visit', label: 'Вперше у нас' },
  { id: 'sunday-school', label: 'Недільна школа' },
  { id: 'holidays', label: 'Свята' },
  { id: 'prayer', label: 'Молитовні потреби' },
  { id: 'contacts', label: 'Контакти' },
];

export const hero = {
  image: hallImg,
  lead: 'Приходьте такими, якими ви є. Тут прославляють Бога, відкривають Його Слово і моляться одне за одного — як одна родина.',
};

// Замініть на реальні записи з YouTube-каналу (url — посилання на відео)
export const stream = { image: streamImg };

export const recordings = [
  { date: '20 вересня 2026', title: 'Недільне ранкове богослужіння', image: record1Img, url: 'https://www.youtube.com/channel/UCFhEhiIQp2THnSjOVhTYRUg' },
  { date: '13 вересня 2026', title: 'Недільне ранкове богослужіння', image: record2Img, url: 'https://www.youtube.com/channel/UCFhEhiIQp2THnSjOVhTYRUg' },
  { date: '6 вересня 2026', title: 'Недільне вечірнє богослужіння', image: record3Img, url: 'https://www.youtube.com/channel/UCFhEhiIQp2THnSjOVhTYRUg' },
];

export const schedule = [
  { day: 'Неділя', time: '10:00', title: 'Ранкове богослужіння', text: 'Загальноцерковне служіння: прославлення, проповідь Слова Божого, молитва. Паралельно — недільна школа.' },
  { day: 'Неділя', time: '18:00', title: 'Вечірнє богослужіння', text: 'Загальноцерковне служіння для всіх, кому зручніше ввечері.' },
  { day: 'Середа', time: '19:00', title: 'Молитовне служіння', text: 'Загальноцерковна молитва за церкву, місто, Україну та ваші потреби.' },
  { day: 'Субота', time: '19:00', title: 'Молодіжне служіння', text: 'Спілкування, прославлення і живі теми для молоді. Анонси — в Instagram @svitankova_youth.' },
];

export const firstVisit = {
  steps: [
    { title: 'Приходьте в неділю', text: 'На 10:00 або 18:00. Біля входу вас зустрінуть і підкажуть, де сісти.' },
    { title: 'Богослужіння', text: 'Близько двох годин: пісні прославлення, проповідь і спільна молитва. Одяг — звичайний.' },
    { title: 'Чай і знайомство', text: 'Після служіння лишайтеся на чай — пастор і служителі із радістю познайомляться з вами.' },
  ],
  faq: [
    { q: 'Чи потрібно якось готуватися до першого візиту?', a: 'Ні. Просто приходьте. Якщо маєте Біблію — візьміть, якщо ні — дамо на місці.' },
    { q: 'Чи можна прийти, якщо я не член церкви?', a: 'Звісно. Більшість людей колись прийшли вперше саме так. Двері відкриті для всіх.' },
    { q: 'Як стати членом церкви?', a: 'Поговоріть із пастором після будь-якого служіння — він розповість про наступні кроки: навчання, водне хрещення і членство.' },
  ],
};

export const sundaySchool = {
  image: schoolImg,
  points: ['Біблійні історії та уроки', 'Пісні та молитва', 'Творчість і свята', 'Дружба та підтримка'],
};

export const events = [
  { day: '04', month: 'жовтня', title: 'Свято Жнив', meta: 'Неділя, 10:00 · Дім молитви', tag: 'Для всіх', image: harvestImg },
  { day: '17', month: 'жовтня', title: 'Молодіжна конференція «Світло»', meta: 'Субота, 16:00 · Дім молитви', tag: 'Молодь', image: youthImg },
  { day: '25', month: 'жовтня', title: 'Водне хрещення', meta: 'Неділя, 12:00 · Місце уточнюється', tag: 'Хрещення', image: baptismImg },
];

export const pastor = {
  name: 'Володимир Прит',
  role: 'Пастор церкви',
  // Цитату пастора впишіть його власними словами; поки що — запрошення від церкви
  quote: null,
  bio: 'Пастор церкви «Світанкова Зоря». Пасторська розмова, молитва чи порада — після будь-якого богослужіння або за попереднім записом.',
  image: null,
};

// Диякони церкви
export const deacons = Array.from({ length: 8 }, () => ({ name: 'Брат Ім’я Прізвище', role: 'Диякон', image: null }));

// Дати свят. Рухомі свята (Вербна неділя, Пасха, Вознесіння, Трійця,
// День Братерства) щороку інші — перевіряйте з календарем УЦХВЄ.
export const holidays = {
  year: 2026,
  items: [
    { date: '2026-01-06', name: 'Хрещення Ісуса Христа' },
    { date: '2026-02-02', name: 'Стрітення Господнє' },
    { date: '2026-03-25', name: 'Благовіщення' },
    { date: '2026-04-05', name: 'В’їзд Господній в Єрусалим' },
    { date: '2026-04-12', name: 'Пасха' },
    { date: '2026-05-21', name: 'Вознесіння' },
    { date: '2026-05-31', name: 'День Святої Трійці' },
    { date: '2026-06-07', name: 'День Братерства УЦХВЄ' },
    { date: '2026-08-06', name: 'Преображення' },
    { date: '2026-12-25', name: 'Різдво Христове' },
  ],
};

export const donate = {
  amounts: [100, 200, 500, 1000],
  purposes: ['Загальні потреби церкви', 'Недільна школа і табори', 'Допомога нужденним', 'Місія та євангелізація'],
  // Посилання на платіжну сторінку (LiqPay / WayForPay / monobank)
  paymentUrl: '#',
};

export const socials = [
  { short: 'YT', name: 'YouTube', text: 'Трансляції і записи богослужінь', url: 'https://www.youtube.com/channel/UCFhEhiIQp2THnSjOVhTYRUg', handle: 'Світанкова Зоря' },
  { short: 'FB', name: 'Facebook', text: 'Новини та анонси церкви', url: 'https://www.facebook.com/profile.php?id=2016910998588915', handle: 'Світанкова ЗОРЯ' },
  { short: 'IG', name: 'Instagram', text: 'Молодь церкви', url: 'https://www.instagram.com/svitankova_youth/', handle: '@svitankova_youth' },
];

// Стрічка «Instagram» у блоці соцмереж. Замініть на справжні пости молоді.
export const instagram = [youthImg, schoolImg, harvestImg, stream.image, baptismImg, record2Img];
