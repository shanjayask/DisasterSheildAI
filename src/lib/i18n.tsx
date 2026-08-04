import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type LanguageCode = 'en' | 'ta' | 'hi' | 'zh' | 'ja' | 'ko' | 'fr';

export const LANGUAGES: { code: LanguageCode; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ta', label: 'Tamil', flag: '🇮🇳' },
  { code: 'hi', label: 'Hindi', flag: '🇮🇳' },
  { code: 'zh', label: 'Chinese', flag: '🇨🇳' },
  { code: 'ja', label: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', label: 'Korean', flag: '🇰🇷' },
  { code: 'fr', label: 'French', flag: '🇫🇷' },
];

type Dict = Record<string, string>;

const en: Dict = {
  'nav.home': 'Home',
  'nav.about': 'About',
  'nav.features': 'Features',
  'nav.alerts': 'Live Alerts',
  'nav.riskMap': 'Risk Map',
  'nav.history': 'Disaster History',
  'nav.news': 'News',
  'nav.login': 'Login',
  'nav.signup': 'Sign Up',
  'nav.dashboard': 'Dashboard',
  'hero.tagline': 'Predict. Prepare. Protect.',
  'hero.subtitle':
    'DisasterShield AI uses real-time data, geospatial intelligence, AI-powered risk analysis, and emergency alerts to help communities prepare for disasters.',
  'hero.checkRisk': 'Check My Risk',
  'hero.exploreMap': 'Explore Live Map',
  'hero.viewAlerts': 'View Disaster Alerts',
  'common.login': 'Login',
  'common.signup': 'Sign Up',
  'common.logout': 'Logout',
  'common.email': 'Email',
  'common.password': 'Password',
  'common.username': 'Username',
  'common.fullName': 'Full Name',
  'common.confirmPassword': 'Confirm Password',
  'common.country': 'Country',
  'common.state': 'State/Province',
  'common.city': 'City',
  'common.address': 'Address or approximate location',
  'common.useMyLocation': 'Use My Current Location',
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.loading': 'Loading...',
  'common.search': 'Search',
  'common.directions': 'Directions',
  'common.call': 'Call',
  'common.acknowledge': 'Acknowledge',
  'common.viewOnMap': 'View on Map',
  'common.findShelter': 'Find Shelter',
  'common.findHospital': 'Find Hospital',
  'common.emergencyGuidance': 'Emergency Guidance',
  'common.callEmergency': 'Call Emergency Services',
  'risk.low': 'LOW',
  'risk.medium': 'MEDIUM',
  'risk.high': 'HIGH',
  'risk.critical': 'CRITICAL',
  'risk.unknown': 'NO DATA',
  'risk.overall': 'Overall Risk',
  'disclaimer':
    'DisasterShield AI provides informational risk assessments and does not replace official emergency warnings or emergency services.',
};

const ta: Dict = {
  'nav.home': 'முகப்பு',
  'nav.about': 'பற்றி',
  'nav.features': 'அம்சங்கள்',
  'nav.alerts': 'நேரடி எச்சரிக்கைகள்',
  'nav.riskMap': 'ஆபத்து வரைபடம்',
  'nav.history': 'பேரழிவு வரலாறு',
  'nav.news': 'செய்திகள்',
  'nav.login': 'உள்நுழை',
  'nav.signup': 'பதிவு',
  'nav.dashboard': 'டாஷ்போர்டு',
  'hero.tagline': 'கணித்தற். தயாராகு. பாதுகா.',
  'hero.subtitle':
    'DisasterShield AI நிகழ்நேர தரவு, புவியியல் நுண்ணறிவு, AI இயங்கும் ஆபத்து பகுப்பாய்வு மற்றும் அவசர எச்சரிக்கைகளைப் பயன்படுத்துகிறது.',
  'hero.checkRisk': 'என் ஆபத்தை சரிபார்',
  'hero.exploreMap': 'நேரடி வரைபடம்',
  'hero.viewAlerts': 'பேரழிவு எச்சரிக்கைகள்',
  'common.login': 'உள்நுழை',
  'common.logout': 'வெளியேறு',
  'common.email': 'மின்னஞ்சல்',
  'common.password': 'கடவுச்சொல்',
  'common.loading': 'ஏற்றுகிறது...',
  'risk.overall': 'மொத்த ஆபத்து',
  'disclaimer':
    'DisasterShield AI தகவல் அடிப்படையிலான ஆபத்து மதிப்பீடுகளை வழங்குகிறது மற்றும் அதிகாரப்பூர்வ அவசர எச்சரிக்கைகளுக்கு மாற்றாக அல்ல.',
};

const hi: Dict = {
  'nav.home': 'होम',
  'nav.about': 'परिचय',
  'nav.features': 'विशेषताएँ',
  'nav.alerts': 'लाइव अलर्ट',
  'nav.riskMap': 'जोखिम मानचित्र',
  'nav.history': 'आपदा इतिहास',
  'nav.news': 'समाचार',
  'nav.login': 'लॉगिन',
  'nav.signup': 'साइन अप',
  'nav.dashboard': 'डैशबोर्ड',
  'hero.tagline': 'भविष्यवाणी करें। तैयार रहें। रक्षा करें।',
  'hero.subtitle':
    'DisasterShield AI वास्तविक समय डेटा, भू-स्थानिक खुफिया जानकारी, AI-संचालित जोखिम विश्लेषण और आपातकालीन अलर्ट का उपयोग करता है।',
  'hero.checkRisk': 'मेरा जोखिम जांचें',
  'hero.exploreMap': 'लाइव मानचित्र देखें',
  'hero.viewAlerts': 'आपदा अलर्ट देखें',
  'common.login': 'लॉगिन',
  'common.logout': 'लॉगआउट',
  'common.email': 'ईमेल',
  'common.password': 'पासवर्ड',
  'common.loading': 'लोड हो रहा है...',
  'risk.overall': 'कुल जोखिम',
  'disclaimer':
    'DisasterShield AI सूचनात्मक जोखिम आकलन प्रदान करता है और आधिकारिक आपातकालीन चेतावनियों का स्थान नहीं लेता।',
};

const zh: Dict = {
  'nav.home': '首页',
  'nav.about': '关于',
  'nav.features': '功能',
  'nav.alerts': '实时警报',
  'nav.riskMap': '风险地图',
  'nav.history': '灾害历史',
  'nav.news': '新闻',
  'nav.login': '登录',
  'nav.signup': '注册',
  'nav.dashboard': '仪表板',
  'hero.tagline': '预测。准备。保护。',
  'hero.subtitle':
    'DisasterShield AI 使用实时数据、地理空间智能、AI驱动的风险分析和紧急警报。',
  'hero.checkRisk': '检查我的风险',
  'hero.exploreMap': '探索实时地图',
  'hero.viewAlerts': '查看灾害警报',
  'common.login': '登录',
  'common.logout': '退出',
  'common.loading': '加载中...',
  'risk.overall': '总体风险',
  'disclaimer': 'DisasterShield AI 提供信息性风险评估，不替代官方紧急警告。',
};

const ja: Dict = {
  'nav.home': 'ホーム',
  'nav.about': '概要',
  'nav.features': '機能',
  'nav.alerts': 'ライブアラート',
  'nav.riskMap': 'リスクマップ',
  'nav.history': '災害履歴',
  'nav.news': 'ニュース',
  'nav.login': 'ログイン',
  'nav.signup': '登録',
  'nav.dashboard': 'ダッシュボード',
  'hero.tagline': '予測。準備。保護。',
  'hero.subtitle':
    'DisasterShield AIはリアルタイムデータ、地理空間インテリジェンス、AIリスク分析、緊急アラートを使用します。',
  'hero.checkRisk': 'リスクを確認',
  'hero.exploreMap': 'ライブマップ',
  'hero.viewAlerts': '災害アラート',
  'common.login': 'ログイン',
  'common.logout': 'ログアウト',
  'common.loading': '読み込み中...',
  'risk.overall': '総合リスク',
  'disclaimer': 'DisasterShield AIは情報提供用のリスク評価であり、公式の緊急警告の代わりにはなりません。',
};

const ko: Dict = {
  'nav.home': '홈',
  'nav.about': '소개',
  'nav.features': '기능',
  'nav.alerts': '실시간 경고',
  'nav.riskMap': '위험 지도',
  'nav.history': '재난 역사',
  'nav.news': '뉴스',
  'nav.login': '로그인',
  'nav.signup': '가입',
  'nav.dashboard': '대시보드',
  'hero.tagline': '예측. 준비. 보호.',
  'hero.subtitle':
    'DisasterShield AI는 실시간 데이터, 지리공간 지능, AI 위험 분석 및 비상 경고를 사용합니다.',
  'hero.checkRisk': '내 위험 확인',
  'hero.exploreMap': '실시간 지도',
  'hero.viewAlerts': '재난 경고',
  'common.login': '로그인',
  'common.logout': '로그아웃',
  'common.loading': '로딩 중...',
  'risk.overall': '전체 위험',
  'disclaimer': 'DisasterShield AI는 정보 제공용 위험 평가이며 공식 비상 경고를 대체하지 않습니다.',
};

const fr: Dict = {
  'nav.home': 'Accueil',
  'nav.about': 'À propos',
  'nav.features': 'Fonctionnalités',
  'nav.alerts': 'Alertes en direct',
  'nav.riskMap': 'Carte des risques',
  'nav.history': 'Historique des catastrophes',
  'nav.news': 'Actualités',
  'nav.login': 'Connexion',
  'nav.signup': "S'inscrire",
  'nav.dashboard': 'Tableau de bord',
  'hero.tagline': 'Prédire. Préparer. Protéger.',
  'hero.subtitle':
    "DisasterShield AI utilise des données en temps réel, l'intelligence géospatiale, l'analyse des risques par IA et les alertes d'urgence.",
  'hero.checkRisk': 'Vérifier mon risque',
  'hero.exploreMap': 'Explorer la carte',
  'hero.viewAlerts': 'Voir les alertes',
  'common.login': 'Connexion',
  'common.logout': 'Déconnexion',
  'common.loading': 'Chargement...',
  'risk.overall': 'Risque global',
  'disclaimer':
    "DisasterShield AI fournit des évaluations de risques informatives et ne remplace pas les avertissements d'urgence officiels.",
};

const dicts: Record<LanguageCode, Dict> = { en, ta, hi, zh, ja, ko, fr };

interface I18nContextValue {
  lang: LanguageCode;
  setLang: (l: LanguageCode) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('ds_lang') as LanguageCode | null;
    return saved || 'en';
  });

  useEffect(() => {
    localStorage.setItem('ds_lang', lang);
  }, [lang]);

  const setLang = (l: LanguageCode) => setLangState(l);
  const t = (key: string) => dicts[lang][key] || en[key] || key;

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
