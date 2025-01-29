export enum Region {
  eu = 'Europe',
  kr = 'Korea',
  us = 'North America',
  tw = 'Taiwan',
}

export type Locale = {
  [Region.kr]: LocaleKr;
  [Region.eu]: LocaleEu;
  [Region.us]: LocaleNa;
  [Region.tw]: LocaleTw;
};

enum LocaleEu {
  en_GB = 'en_GB',
  es_ES = 'es_ES',
  fr_FR = 'fr_FR',
  ru_RU = 'ru_RU',
  de_DE = 'de_DE',
  pt_PT = 'pt_PT',
  it_IT = 'it_IT',
}

enum LocaleNa {
  en_US = 'en_US',
  es_MX = 'es_MX',
  pt_BR = 'pt_BR',
}

enum LocaleKr {
  ko_KR = 'ko_KR',
}

enum LocaleTw {
  zh_TW = 'zh_TW',
}
