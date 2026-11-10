// Real cases from @dr.fozilkhon captions / highlight banners. Neutral clinical wording only.
export const PHONE = '+998946511163';
export const PHONE_H = '+998 94 651-11-63';
export const IG = 'https://ig.me/m/dr.fozilkhon';

// lat, lon
export const TASHKENT = { lat: 41.31, lon: 69.24 };

export const COUNTRIES = {
  kz: { ru: 'Казахстан', uz: 'Qozog‘iston' },
  tj: { ru: 'Таджикистан', uz: 'Tojikiston' },
  kg: { ru: 'Кыргызстан', uz: 'Qirg‘iziston' },
  ru: { ru: 'Россия', uz: 'Rossiya' },
  uz: { ru: 'Регионы Узбекистана', uz: 'O‘zbekiston viloyatlari' },
};

// inbound arcs: places named in his captions / highlight banners
export const ORIGINS = [
  { id: 'aktau', c: 'kz', lat: 43.65, lon: 51.17, ru: 'Актау', uz: 'Aqtov' },
  { id: 'taraz', c: 'kz', lat: 42.90, lon: 71.37, ru: 'Тараз', uz: 'Taroz' },
  { id: 'dushanbe', c: 'tj', lat: 38.56, lon: 68.77, ru: 'Душанбе', uz: 'Dushanbe' },
  { id: 'kg', c: 'kg', lat: 41.9, lon: 74.6, ru: 'Кыргызстан', uz: 'Qirg‘iziston' },
  { id: 'russia', c: 'ru', lat: 55.75, lon: 37.62, ru: 'Россия', uz: 'Rossiya' },
  { id: 'nukus', c: 'uz', lat: 42.46, lon: 59.60, ru: 'Каракалпакстан', uz: 'Qoraqalpog‘iston' },
  { id: 'khorezm', c: 'uz', lat: 41.55, lon: 60.63, ru: 'Хорезм', uz: 'Xorazm' },
  { id: 'namangan', c: 'uz', lat: 41.00, lon: 71.67, ru: 'Наманган', uz: 'Namangan' },
  { id: 'bukhara', c: 'uz', lat: 39.77, lon: 64.42, ru: 'Бухара', uz: 'Buxoro' },
];

// outbound arcs: training
export const TRAINING = [
  { id: 'kirov', lat: 58.60, lon: 49.65, ru: 'Киров', uz: 'Kirov' },
  { id: 'moscow', lat: 55.75, lon: 37.62, ru: 'Москва', uz: 'Moskva' },
  { id: 'antalya', lat: 36.90, lon: 30.70, ru: 'Анталья', uz: 'Antaliya' },
  { id: 'graz', lat: 47.07, lon: 15.44, ru: 'Грац', uz: 'Grats' },
  { id: 'trichy', lat: 10.80, lon: 78.70, ru: 'Тричи', uz: 'Trichi' },
  { id: 'istanbul', lat: 41.01, lon: 28.97, ru: 'Стамбул', uz: 'Istanbul' },
  { id: 'piacenza', lat: 45.05, lon: 9.69, ru: 'Пьяченца', uz: 'Piachensa' },
];

const v = (code) => ({ type: 'v', src: `media/v/${code}.mp4`, poster: `media/vp/${code}_5.jpg` });
const im = (src) => ({ type: 'i', poster: src });

export const CASES = [
  // Kazakhstan
  { c: 'kz', ...v('DY_ZNxQSl_M'), place: { ru: 'Актау', uz: 'Aqtov' },
    t: { ru: 'Тимпанопластика с восстановлением цепи слуховых косточек', uz: 'Timpanoplastika va eshitish suyakchalari zanjirini tiklash' },
    d: { ru: 'Пациентка из Актау обратилась со снижением слуха.', uz: 'Aqtovlik bemor eshitish pasayishi bilan murojaat qilgan.' } },
  { c: 'kz', ...v('DdSzbErx9dk'), place: { ru: 'Казахстан', uz: 'Qozog‘iston' },
    t: { ru: 'Перфорация перепонки, смешанная тугоухость II степени', uz: 'Nog‘ora parda teshigi, II darajali aralash karlik' },
    d: { ru: 'Восстановлена целостность перепонки, реконструированы слуховые косточки.', uz: 'Nog‘ora parda butunligi tiklangan, eshitish suyakchalari rekonstruksiya qilingan.' } },
  { c: 'kz', ...v('Da79GmgxrLc'), place: { ru: 'Казахстан', uz: 'Qozog‘iston' },
    t: { ru: 'Пластика барабанной перепонки через слуховой проход', uz: 'Quloq yo‘li orqali nog‘ora parda plastikasi' },
    d: { ru: 'Эндауральный доступ — без разреза за ухом.', uz: 'Endaural yondashuv — quloq ortida kesiksiz.' } },
  { c: 'kz', ...v('DaJ_or6qPf2'), place: { ru: 'Казахстан', uz: 'Qozog‘iston' },
    t: { ru: 'Заложенность носа и зависимость от спреев', uz: 'Burun bitishi va spreylarga qaramlik' },
    d: { ru: 'Эндоскопическая септопластика; видео — через месяц после операции.', uz: 'Endoskopik septoplastika; video — operatsiyadan bir oy o‘tib.' } },
  { c: 'kz', ...v('DZkY--gubUQ'), place: { ru: 'Казахстан', uz: 'Qozog‘iston' },
    t: { ru: 'Перфорация носовой перегородки', uz: 'Burun to‘sig‘i teshigi' },
    d: { ru: 'Перфорация закрыта эндоскопическим способом.', uz: 'Teshik endoskopik usulda yopilgan.' } },
  { c: 'kz', ...v('DUAGpVgAiW4'), place: { ru: 'Казахстан', uz: 'Qozog‘iston' },
    t: { ru: 'Контроль через два года после тимпанопластики', uz: 'Timpanoplastikadan ikki yil o‘tib nazorat' },
    d: { ru: 'Пациентка вернулась на осмотр спустя два года.', uz: 'Bemor ikki yildan so‘ng ko‘rikka qaytgan.' } },
  { c: 'kz', ...im('media/p/Dd5iN8zxxWE.jpg'), place: { ru: 'Казахстан', uz: 'Qozog‘iston' },
    t: { ru: 'Повторный приезд — операция на втором ухе', uz: 'Qayta tashrif — ikkinchi quloqdagi operatsiya' },
    d: { ru: 'После операции на одном ухе пациент приехал снова — для второго.', uz: 'Bir quloqdagi operatsiyadan so‘ng bemor ikkinchisi uchun yana kelgan.' } },
  // Tajikistan
  { c: 'tj', ...v('DaE3R-Ox0m6'), place: { ru: 'Таджикистан', uz: 'Tojikiston' },
    t: { ru: 'Смешанная тугоухость — тимпанопластика II типа', uz: 'Aralash karlik — II turdagi timpanoplastika' },
    d: { ru: 'Установлен частичный протез слуховых косточек.', uz: 'Eshitish suyakchalarining qisman protezi o‘rnatilgan.' } },
  { c: 'tj', ...v('Daagg7jOC0I'), place: { ru: 'Таджикистан', uz: 'Tojikiston' },
    t: { ru: 'Отосклероз — титановый протез', uz: 'Otoskleroz — titan protez' },
    d: { ru: 'Повреждённая косточка заменена титановым протезом.', uz: 'Shikastlangan suyakcha titan protez bilan almashtirilgan.' } },
  { c: 'tj', ...v('Dc1N-S1ObwD'), place: { ru: 'Таджикистан', uz: 'Tojikiston' },
    t: { ru: 'Искривление перегородки носа', uz: 'Burun to‘sig‘i qiyshiqligi' },
    d: { ru: 'Радиоволновая септопластика; видео — через три месяца.', uz: 'Radioto‘lqinli septoplastika; video — uch oydan so‘ng.' } },
  { c: 'tj', ...v('DVi4UXgDuE5'), place: { ru: 'Таджикистан', uz: 'Tojikiston' },
    t: { ru: 'Полипы носа — эндоскопическое удаление', uz: 'Burun poliplari — endoskopik olib tashlash' },
    d: { ru: 'Жалобы на затруднённое носовое дыхание.', uz: 'Burun orqali nafas olish qiyinligi.' } },
  { c: 'tj', ...v('DU3Ozu1An1w'), place: { ru: 'Таджикистан', uz: 'Tojikiston' },
    t: { ru: 'Восстановление перепонки и частичный протез', uz: 'Nog‘ora pardani tiklash va qisman protez' },
    d: { ru: 'Жалоба — снижение слуха.', uz: 'Shikoyat — eshitish pasayishi.' } },
  { c: 'tj', ...im('media/p/DcEaT5GuOy7.jpg'), place: { ru: 'Душанбе', uz: 'Dushanbe' },
    t: { ru: 'Пациент из Душанбе', uz: 'Dushanbelik bemor' },
    d: { ru: 'Клинический случай из публикаций доктора.', uz: 'Shifokor nashrlaridagi klinik holat.' } },
  // Kyrgyzstan
  { c: 'kg', ...im('media/p/Ddy_TTtR77Y.jpg'), place: { ru: 'Кыргызстан', uz: 'Qirg‘iziston' },
    t: { ru: 'Образование среднего уха', uz: 'O‘rta quloqdagi hosila' },
    d: { ru: 'Удаление образования, восстановление цепи косточек, тимпанопластика.', uz: 'Hosilani olib tashlash, suyakchalar zanjirini tiklash, timpanoplastika.' } },
  { c: 'kg', ...im('media/hl/kg_03.jpg'), place: { ru: 'Кыргызстан', uz: 'Qirg‘iziston' },
    t: { ru: 'Операционный день', uz: 'Operatsiya kuni' },
    d: { ru: 'Кадры из раздела историй «Кыргызстан».', uz: '«Qirg‘iziston» hikoyalar bo‘limidan kadrlar.' } },
  { c: 'kg', ...im('media/p/DZWg3zyqCuo.jpg'), place: { ru: 'Кыргызстан', uz: 'Qirg‘iziston' },
    t: { ru: 'Тимпанопластика с восстановлением цепи косточек', uz: 'Timpanoplastika va suyakchalar zanjirini tiklash' },
    d: { ru: 'Жалоба — снижение слуха.', uz: 'Shikoyat — eshitish pasayishi.' } },
  { c: 'kg', ...im('media/p/DWeE8D-ORq7.jpg'), place: { ru: 'Кыргызстан', uz: 'Qirg‘iziston' },
    t: { ru: 'Отосклероз — титановый протез', uz: 'Otoskleroz — titan protez' },
    d: { ru: 'Операция на стремечке с установкой протеза.', uz: 'Uzangi suyakchasida protez o‘rnatish operatsiyasi.' } },
  // Russia
  { c: 'ru', ...im('media/p/DcrGEQotyjI.jpg'), place: { ru: 'Россия', uz: 'Rossiya' },
    t: { ru: 'Рецидив холестеатомы', uz: 'Xolesteatoma qaytalanishi' },
    d: { ru: 'Ранее оперирована в Москве; после обследования принято решение о повторной операции.', uz: 'Avval Moskvada operatsiya qilingan; tekshiruvdan so‘ng qayta operatsiya qarori qabul qilingan.' } },
  // Uzbekistan regions
  { c: 'uz', ...im('media/p/DeRx-eYR-jQ.jpg'), place: { ru: 'Каракалпакстан', uz: 'Qoraqalpog‘iston' },
    t: { ru: 'Тимпаносклероз', uz: 'Timpanoskleroz' },
    d: { ru: 'Восстановление перепонки и реконструкция цепи косточек.', uz: 'Nog‘ora pardani tiklash va suyakchalar zanjirini rekonstruksiya qilish.' } },
  { c: 'uz', ...im('media/p/DYYstOhR_SJ.jpg'), place: { ru: 'Каракалпакстан', uz: 'Qoraqalpog‘iston' },
    t: { ru: 'Перфорация — эндауральная тимпанопластика', uz: 'Teshik — endaural timpanoplastika' },
    d: { ru: 'Операция через слуховой проход под общим наркозом.', uz: 'Umumiy narkoz ostida quloq yo‘li orqali operatsiya.' } },
  { c: 'uz', ...im('media/p/Dd29bJaRIyi.jpg'), place: { ru: 'Хорезм', uz: 'Xorazm' },
    t: { ru: 'Хроническая заложенность носа', uz: 'Surunkali burun bitishi' },
    d: { ru: 'Эндоскопическое обследование и хирургическое лечение.', uz: 'Endoskopik tekshiruv va jarrohlik davolash.' } },
  { c: 'uz', ...im('media/p/DcwCq6lunjZ.jpg'), place: { ru: 'Хорезм', uz: 'Xorazm' },
    t: { ru: 'Отосклероз — титановый протез', uz: 'Otoskleroz — titan protez' },
    d: { ru: 'Замена повреждённой косточки.', uz: 'Shikastlangan suyakchani almashtirish.' } },
  { c: 'uz', ...im('media/p/DbZyBfiRQJn.jpg'), place: { ru: 'Хорезм', uz: 'Xorazm' },
    t: { ru: 'Деформация перегородки', uz: 'Burun to‘sig‘i deformatsiyasi' },
    d: { ru: 'Эндоскопическая септопластика.', uz: 'Endoskopik septoplastika.' } },
  { c: 'uz', ...im('media/p/Dc-sdTWucWh.jpg'), place: { ru: 'Наманган', uz: 'Namangan' },
    t: { ru: 'Тимпанопластика II типа', uz: 'II turdagi timpanoplastika' },
    d: { ru: 'Жалобы на снижение слуха и шум в ушах.', uz: 'Eshitish pasayishi va quloqdagi shovqin shikoyatlari.' } },
  { c: 'uz', ...im('media/p/DZ2UyM7uV1l.jpg'), place: { ru: 'Бухара', uz: 'Buxoro' },
    t: { ru: 'Выездные консультации в Бухаре', uz: 'Buxorodagi ko‘chma konsultatsiyalar' },
    d: { ru: 'Консультации команды LOR-PREMIUM в Бухаре, 3–4 июня.', uz: 'LOR-PREMIUM jamoasining Buxorodagi konsultatsiyalari, 3–4 iyun.' } },
];

export const REVIEWS = [0, 2, 3, 4, 5, 6, 9, 12, 13, 17, 20, 24, 34, 35, 48, 52];
