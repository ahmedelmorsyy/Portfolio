// Ahmed Elmorsy Portfolio - Main Entry Logic
import L from 'leaflet';

// ─────── 1. Theme Management (Light / Dark) ───────
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeToggleIcon');
const htmlEl = document.documentElement;

// Default theme is LIGHT as requested by user
const savedTheme = localStorage.getItem('theme') || 'light';
htmlEl.setAttribute('data-theme', savedTheme);
updateThemeUI(savedTheme);

themeToggle.addEventListener('click', () => {
  const currentTheme = htmlEl.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  htmlEl.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeUI(newTheme);
  updateMapTiles(newTheme);
});

function updateThemeUI(theme) {
  if (theme === 'dark') {
    themeIcon.className = 'ti ti-sun';
    themeToggle.title = 'Switch to Light Theme';
  } else {
    themeIcon.className = 'ti ti-moon';
    themeToggle.title = 'Switch to Dark Theme';
  }
}


// ─────── 2. Bilingual Translator (English <-> Arabic) ───────
const i18n = {
  en: {
    // Navigation
    'nav-about': 'About',
    'nav-projects': 'Projects',
    'nav-skills': 'Skills',
    'nav-certificates': 'Certificates',
    'nav-services': 'Services',
    'nav-contact': 'Contact',

    // Hero
    'hero-label': 'GIS & Remote Sensing Specialist · Spatial AI & Vibe Coder',
    'hero-tag': 'I translate complex spatial datasets into empirical intelligence and high-fidelity web applications. Specialized in ArcGIS Pro, Google Earth Engine, Random Forest Spatial ML, and Vibe Coding.',
    'hero-cta-projects': 'Explore Case Studies',
    'hero-cta-contact': 'Get In Touch',
    'hero-scroll': 'scroll',

    // About
    'about-label': '01 · About',
    'about-title': 'Translating data into spatial intelligence.',
    'about-lead': 'A GIS Analyst, Remote Sensing Specialist, and Vibe Coder bridging spatial science with AI-assisted software development.',
    'about-p1': 'I build advanced geospatial analytical pipelines and interactive web solutions utilizing ArcGIS Pro, Google Earth Engine, Python, and Vibe Coding workflows. My focus is on delivering rigorous spatial statistics, remote sensing change detection, and data-driven decision support systems.',
    'about-p2': 'From monitoring NDVI crop health indices utilizing Landsat & Sentinel satellite data to implementing spatial machine learning models, I develop geospatial solutions with precision and visual excellence.',
    'stat-1': 'Years GIS Specialization',
    'stat-2': 'Geospatial Case Studies',
    'stat-3': 'Spatial ML & AI Models',
    'stat-4': 'Completed Projects',

    // Projects Section
    'projects-label': '02 · Featured Case Studies',
    'projects-title': 'Spatial intelligence & empirical research.',
    'projects-lead': 'Explore 5 flagship Remote Sensing, Machine Learning, Spatial Econometrics, and Health GIS case studies with complete technical reports, presentation decks, and interactive assets.',
    'filter-all': 'All Case Studies',
    'filter-ml': 'Machine Learning & GEE',
    'filter-stats': 'Spatial Statistics',
    'filter-health': 'Health & Urban GIS',
    'btn-view-case-study': 'View Case Study',
    'btn-hide-case-study': 'Collapse Case Study',
    'note-report': 'Full project report is available upon request',

    // Project Titles & Metrics
    'p1-title': 'Solar Energy Site Suitability Analysis in Egypt Using GIS & Machine Learning',
    'p1-sub': 'AI-Driven Multi-Criteria Evaluation & Spatial Machine Learning',
    'p1-desc': 'Identified optimal locations for solar power plant development across Egypt by integrating GEE, Remote Sensing, and Random Forest Machine Learning across 10+ environmental, climatic, and infrastructure criteria.',
    'p1-m1-lbl': 'Overall Model Accuracy',
    'p1-m2-lbl': 'Training Samples',
    'p1-m3-lbl': 'Spatial Criteria',
    'p1-m4-lbl': 'Suitability Map',

    'p2-title': 'Spatial Analysis of Secondary Education Services in Port Said Governorate, Egypt',
    'p2-sub': 'Spatial Econometrics, Hotspot Analysis (Getis-Ord Gi*), Moran\'s I & GWR Modeling',
    'p2-desc': 'Evaluated secondary education spatial efficiency, catchment equity, and service gaps across 8 administrative districts in Port Said Governorate using spatial econometrics, Getis-Ord Gi* hotspot clustering, Moran\'s I, and Geographically Weighted Regression (GWR).',
    'p2-m1-lbl': 'Secondary Schools',
    'p2-m2-lbl': 'District Population',
    'p2-m3-lbl': 'Spatial Statistics',
    'p2-m4-lbl': 'Econometric Model',

    'p3-title': 'Qattara Depression Development Assessment Using GIS, Remote Sensing & Artificial Intelligence',
    'p3-sub': 'Morphometric, Climatic, Hydrological & Weakly Supervised Random Forest AI Modeling',
    'p3-desc': 'Integrated geospatial & environmental decision-support framework evaluating Africa\'s largest depression (~19,500 km², -133m elevation) for water transfer pathways, agriculture, infrastructure, and climate adaptation.',
    'p3-m1-lbl': 'Study Area',
    'p3-m2-lbl': 'AI Models',
    'p3-m3-lbl': 'Model Accuracy',
    'p3-m4-lbl': 'Highly Suitable Zone',

    'p4-title': 'Agricultural Land Expansion Analysis in Farafra Depression, Egypt Using Remote Sensing & Artificial Intelligence',
    'p4-sub': '34-Year Satellite Change Detection & Random Forest Classification (1990–2024)',
    'p4-desc': 'Analyzed 34-year spatiotemporal agricultural evolution in Farafra Oasis using multi-temporal Landsat imagery (1990–2024), spectral indices (NDVI, SAVI, NDWI, EVI), and Random Forest machine learning.',
    'p4-m1-lbl': 'Satellite Time Series',
    'p4-m2-lbl': 'Agricultural Area',
    'p4-m3-lbl': 'Land Growth Rate',
    'p4-m4-lbl': 'AI Classifier',

    'p5-title': 'Healthcare Services & Endemic Diseases Spatial Analysis in Belqas District, Egypt',
    'p5-sub': 'Network Analysis, Accessibility Modeling & Environmental Disease Risk Mapping',
    'p5-desc': 'Investigated spatial accessibility of healthcare services and their correlation with 12 endemic & chronic disease categories across Belqas District, Dakahlia Governorate to identify underserved areas and support health planning.',
    'p5-m1-lbl': 'Disease Categories',
    'p5-m2-lbl': 'Priority Hospitals',
    'p5-m3-lbl': 'Analyst Service Area',
    'p5-m4-lbl': 'Decision Support',

    // Credentials
    'c1-title': 'Geographic Information Systems (GIS)',
    'c1-desc': 'Comprehensive specialization covering GIS fundamentals, spatial data formats, coordinate reference systems, spatial SQL query creation, and multi-criteria raster analysis.',
    'c2-title': 'Satellite Imagery, Remote Sensing & ML',
    'c2-desc': 'Advanced methodology for acquiring, processing, and analyzing satellite imagery, including 3D LiDAR, SAR radar, multi-spectral data, and machine learning models for earth observation.',
    'c-verify': 'Verify Credential',

    // Skills
    'skills-label': '03 · Toolkit',
    'skills-title': 'Geospatial skills & analytical stack.',
    'skills-lead': 'My specialized GIS, Remote Sensing, Spatial AI, and Vibe Coding technology stack.',
    'skill-cat-1': 'Core GIS & Remote Sensing',
    'skill-cat-2': 'Spatial ML & Vibe Coding',
    'skill-cat-3': 'Spatial Statistics & Econometrics',
    'skill-cat-4': 'Environmental & Raster Analytics',

    // Credentials
    'certs-label': '04 · Credentials',
    'certs-title': 'Certified expertise & academic milestones.',
    'certs-lead': 'Verified professional specializations and academic course achievements from leading global universities and technology leaders via Coursera.',
    'certs-sub-indiv': 'Professional Individual Courses',

    // Services
    'services-label': '05 · Services',
    'services-title': 'Software development and GIS mapping services.',
    'services-lead': 'Comprehensive geospatial consulting, AI-driven spatial analysis, custom web mapping dashboards, and remote sensing solutions.',

    // Contact
    'contact-label': '06 · Contact',
    'contact-direct-title': 'Direct Channels',
    'contact-phone-lbl': 'Phone',
    'contact-wa-lbl': 'WhatsApp',
    'contact-email-lbl': 'Email Address',
    'contact-linkedin-lbl': 'LinkedIn',
    'contact-location-title': 'Office Location',
    'form-title': 'Send a Message',
    'form-name-lbl': 'Your Name',
    'form-email-lbl': 'Your Email',
    'form-project-lbl': 'Project Type',
    'form-select-opt': 'Select an option...',
    'opt-gis': 'GIS Interactive Map',
    'opt-dashboard': 'Web Dashboard',
    'opt-custom': 'Custom Web App',
    'opt-landing': 'Landing Page',
    'opt-other': 'Other Inquiry',
    'form-message-lbl': 'Message Details',
    'form-submit': 'Send Message',
    'form-feedback': 'Message sent successfully! Thank you for reaching out.',

    // Footer
    'footer-desc': 'GIS Analyst, Remote Sensing Specialist, Spatial AI & Vibe Coder based in Egypt.',
    'footer-nav-title': 'Navigation',
    'footer-sync-title': 'Geospatial Sync',
    'footer-loc': 'Cairo, Egypt',
    'footer-tz': 'UTC+02:00 Timezone',
    'footer-remote': 'Available for Remote & Freelance Contracts'
  },
  ar: {
    // Navigation
    'nav-about': 'من أنا',
    'nav-projects': 'المشاريع',
    'nav-skills': 'المهارات',
    'nav-certificates': 'الشهادات',
    'nav-services': 'الخدمات',
    'nav-contact': 'التواصل',

    // Hero
    'hero-label': 'أخصائي نظم معلومات جغرافية واستشعار عن بُعد · ذكاء اصطناعي مكاني ومطور Vibe Coder',
    'hero-tag': 'أقوم بتحويل البيانات المكانية المعقدة إلى تحليلات استراتيجية وتطبيقات تفاعلية عالية الجودة. متخصص في ArcGIS Pro و Google Earth Engine و Random Forest ML و Vibe Coding.',
    'hero-cta-projects': 'استعرض دراسات الحالة',
    'hero-cta-contact': 'تواصل معي',
    'hero-scroll': 'تمرير لأسفل',

    // About
    'about-label': '01 · نبذة عني',
    'about-title': 'تحويل البيانات الجغرافية إلى رؤى مكانية ذكية.',
    'about-lead': 'محلل نظم معلومات جغرافية واستشعار عن بُعد ومطور Vibe Coder يجمع بين علوم البيانات المكانية وتطوير البرمجيات بالذكاء الاصطناعي.',
    'about-p1': 'أقوم ببناء خطوط معالجة مكانية متقدمة وتطبيقات خرائط تفاعلية باستخدام ArcGIS Pro و Google Earth Engine و Python وتقنيات Vibe Coding. أركز على تقديم إحصاءات مكانية دقيقة، وكشف التغيرات بالاستشعار عن بُعد، وأنظمة دعم القرار.',
    'about-p2': 'من مراقبة صحة المحاصيل ومؤشرات NDVI باستخدام أقمار Landsat و Sentinel إلى تدريب نماذج التعلم الآلي المكاني، أطور حلولاً جغرافية مكانية بالغة الدقة والجودة Visual Excellence.',
    'stat-1': 'سنوات خبرة جغرافية',
    'stat-2': 'دراسات حالة مكانية',
    'stat-3': 'نماذج ذكاء اصطناعي مكاني',
    'stat-4': 'مشروع مكتمل',

    // Projects Section
    'projects-label': '02 · دراسات الحالة المميزة',
    'projects-title': 'الذكاء المكاني والأبحاث التطبيقية.',
    'projects-lead': 'استكشف 5 مشاريع رئيسية في الاستشعار عن بُعد، التعلم الآلي المكاني، الاقتصاد القياسي الجغرافي، ونظم المعلومات الصحية مع التقارير الفنية الكاملة والعروض التقديمية.',
    'filter-all': 'جميع دراسات الحالة',
    'filter-ml': 'التعلم الآلي و GEE',
    'filter-stats': 'الإحصاء المكاني',
    'filter-health': 'نظم GIS الصحية والحضرية',
    'btn-view-case-study': 'عرض دراسة الحالة',
    'btn-hide-case-study': 'إخفاء دراسة الحالة',
    'note-report': 'التقرير الفني الكامل للمشروع متاح عند الطلب',

    // Project Titles & Metrics
    'p1-title': 'دراسة ملاءمة مواقع الطاقة الشمسية في مصر باستخدام نظم GIS والتعلم الآلي',
    'p1-sub': 'تقييم متعدد المعايير مدعوم بالذكاء الاصطناعي والتعلم الآلي المكاني',
    'p1-desc': 'تحديد المواقع المثالية لتطوير محطات الطاقة الشمسية في مصر بالدمج بين GEE والاستشعار عن بُعد والتعلم الآلي (Random Forest) عبر أكثر من 10 معايير بيئية ومناخية وبنية تحتية.',
    'p1-m1-lbl': 'دقة النموذج الكلية',
    'p1-m2-lbl': 'عينات التدريب المكانية',
    'p1-m3-lbl': 'معايير التحليل المكاني',
    'p1-m4-lbl': 'خريطة الملاءمة (5 مستويات)',

    'p2-title': 'التحليل المكاني لخدمات التعليم الثانوي العام بمحافظة بورسعيد',
    'p2-sub': 'تحليل الشبكات، تحديد مناطق الخدمة، والإحصاء المكاني المتقدم (Getis-Ord Gi* & GWR)',
    'p2-desc': 'تقييم كفاءة الوصول الجغرافي لمدارس التعليم الثانوي ببورسعيد باستخدام نطاقات الخدمة الزمنية، ونماذج تحليل الشبكات، والنمذجة الاقتصادية المكانية الجغرافية GWR.',
    'p2-m1-lbl': 'مدارس الثانوي العام',
    'p2-m2-lbl': 'إجمالي سكان الأحياء',
    'p2-m3-lbl': 'الإحصاء الجغرافي المكاني',
    'p2-m4-lbl': 'النمذجة الاقتصادية GWR',

    'p3-title': 'تقييم إمكانيات تنمية منخفض القطارة باستخدام نظم GIS والاستشعار عن بُعد والذكاء الاصطناعي',
    'p3-sub': 'نمذجة مورفومترية ومناخية وهيدرولوجية باستعمال 4 نماذج تعلّم آلي Random Forest',
    'p3-desc': 'إطار عمل مكاني وبيئي متكامل لتقييم أكبر منخفض في أفريقيا (~19,500 كم²، -133م تحت سطح البحر) لتحديد مسارات نقل المياه، الزراعة، والتكيف المناخي.',
    'p3-m1-lbl': 'مساحة منطقة الدراسة',
    'p3-m2-lbl': 'نماذج تعلّم آلي',
    'p3-m3-lbl': 'دقة النماذج الكلية',
    'p3-m4-lbl': 'مناطق عالية الملاءمة',

    'p4-title': 'تحليل التوسع الزراعي بفيض منخفض الفرافرة باستخدام الاستشعار عن بُعد والذكاء الاصطناعي',
    'p4-sub': 'كشف التغيرات الفضائية لـ 34 عاماً وتصنيف الغطاء الأرضي (1990–2024)',
    'p4-desc': 'تحليل التطور الزمني والمكاني للأراضي الزراعية بواحة الفرافرة عبر صور أقمار Landsat المتعاقبة (1990–2024) والمؤشرات الطيفية والتعلم الآلي.',
    'p4-m1-lbl': 'السلسلة الزمنية للأقمار',
    'p4-m2-lbl': 'المساحة الزراعية المستصلحة',
    'p4-m3-lbl': 'معدل النمو الزراعي',
    'p4-m4-lbl': 'مصنف الذكاء الاصطناعي',

    'p5-title': 'التحليل المكاني للخدمات الصحية والأمراض المتوطنة بمركز بلقاس بمحافظة الدقهلية',
    'p5-sub': 'تحليل الشبكات، نمذجة الوصول الجغرافي، ورسم خرائط المخاطر البيئية للأمراض',
    'p5-desc': 'دراسة التوزيع المكاني للخدمات الصحية وعلاقتها بـ 12 فئة من الأمراض المتوطنة والمزمنة بمركز بلقاس لتحديد المناطق المحرومة ودعم التخطيط الصحي.',
    'p5-m1-lbl': 'فئات الأمراض المحللة',
    'p5-m2-lbl': 'مستشفيات ذات أولوية',
    'p5-m3-lbl': 'نطاقات الخدمة الشبكية',
    'p5-m4-lbl': 'نظام دعم القرار المكاني',

    // Credentials
    'c1-title': 'تخصص نظم المعلومات الجغرافية (GIS)',
    'c1-desc': 'تخصص شامل يغطي أساسيات GIS، صيغ البيانات المكانية، نظم الإحداثيات، استعلامات SQL المكانية، والتحليل الشبكي متعدد المعايير.',
    'c2-title': 'تخصص الصور الفضائية والاستشعار عن بُعد والتعلم الآلي',
    'c2-desc': 'منهجية متقدمة لمعالجة وتحليل الصور الفضائية، بيانات تقنية LiDAR ثلاثية الأبعاد، الرادار SAR، البيانات متعددة الأطياف، ونماذج التعلم الآلي.',
    'c-verify': 'التحقق من الشهادة',

    // Skills
    'skills-label': '03 · المهارات والتقنيات',
    'skills-title': 'أدوات ونظم التحليل المكاني.',
    'skills-lead': 'منظومة مهاراتي المتخصصة في GIS، الاستشعار عن بُعد، الذكاء الاصطناعي المكاني، وتطوير Vibe Coding.',
    'skill-cat-1': 'نظم GIS والاستشعار عن بُعد الأساسية',
    'skill-cat-2': 'التعلم الآلي المكاني وتطوير Vibe Coding',
    'skill-cat-3': 'الإحصاء المكاني والاقتصاد الجغرافي',
    'skill-cat-4': 'التحليلات البيئية والشبكية Raster',

    // Credentials
    'certs-label': '04 · الشهادات والاعتمادات',
    'certs-title': 'الاعتمادات الأكاديمية والمهنية.',
    'certs-lead': 'تخصصات مهنية وشهادات أكاديمية معتمدة من كبرى الجامعات والمؤسسات التقنية العالمية عبر منصة Coursera.',
    'certs-sub-indiv': 'الشهادات والكورسات المتخصصة',

    // Services
    'services-label': '05 · الخدمات المتاحة',
    'services-title': 'تطوير البرمجيات وخدمات الخرائط المكانية.',
    'services-lead': 'استشارات جغرافية متكاملة، تحليلات مكانية بالذكاء الاصطناعي، لوحات تحكم خرائط تفاعلية، وحلول الاستشعار عن بُعد.',

    // Contact
    'contact-label': '06 · التواصل المباشر',
    'contact-direct-title': 'قنوات الاتصال المباشرة',
    'contact-phone-lbl': 'الهاتف',
    'contact-wa-lbl': 'واتساب',
    'contact-email-lbl': 'البريد الإلكتروني',
    'contact-linkedin-lbl': 'لينكد إن',
    'contact-location-title': 'موقع المكتب',
    'form-title': 'أرسل رسالة',
    'form-name-lbl': 'الاسم',
    'form-email-lbl': 'البريد الإلكتروني',
    'form-project-lbl': 'نوع المشروع',
    'form-select-opt': 'اختر نوع المشروع...',
    'opt-gis': 'خريطة تفاعلية GIS',
    'opt-dashboard': 'لوحة تحكم Web Dashboard',
    'opt-custom': 'تطبيق ويب مخصص',
    'opt-landing': 'صفحة هبوط Landing Page',
    'opt-other': 'استفسار آخر',
    'form-message-lbl': 'تفاصيل الرسالة',
    'form-submit': 'إرسال الرسالة',
    'form-feedback': 'تم إرسال الرسالة بنجاح! شكراً لتواصلك.',

    // Footer
    'footer-desc': 'محلل نظم معلومات جغرافية واستشعار عن بُعد ومطور Vibe Coder مقيم في مصر.',
    'footer-nav-title': 'التنقل',
    'footer-sync-title': 'التزامن المكاني',
    'footer-loc': 'القاهرة، مصر',
    'footer-tz': 'التوقيت المحلي: UTC+02:00',
    'footer-remote': 'متاح للعمل عن بُعد والمشاريع المستقلة'
  }
};

const langToggle = document.getElementById('langToggle');
const langLabel = document.getElementById('langLabel');
let currentLang = localStorage.getItem('lang') || 'en';

function applyLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  htmlEl.setAttribute('lang', lang);
  htmlEl.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  
  if (langLabel) {
    langLabel.textContent = lang === 'ar' ? 'English' : 'العربية';
  }

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (i18n[lang] && i18n[lang][key]) {
      el.textContent = i18n[lang][key];
    }
  });

  // Update drawer toggle button labels dynamically
  document.querySelectorAll('.toggle-case-study-btn').forEach(b => {
    const textSpan = b.querySelector('.btn-text');
    const targetId = b.getAttribute('data-target');
    const targetEl = document.querySelector(targetId);
    if (textSpan && targetEl) {
      const isHidden = targetEl.style.display === 'none' || getComputedStyle(targetEl).display === 'none';
      if (isHidden) {
        textSpan.textContent = lang === 'ar' ? 'عرض دراسة الحالة' : 'View Case Study';
      } else {
        textSpan.textContent = lang === 'ar' ? 'إخفاء دراسة الحالة' : 'Collapse Case Study';
      }
    }
  });
}

// Initial language application
applyLanguage(currentLang);

if (langToggle) {
  langToggle.addEventListener('click', () => {
    const newLang = currentLang === 'ar' ? 'en' : 'ar';
    applyLanguage(newLang);
  });
}


// ─────── 3. Animation Engine (Scroll Reveals, Counters, Progress Bars & Magnetic Buttons) ───────
const breathGuide = document.getElementById('breathGuide');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      entry.target.classList.add('is-in');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.fade-up, .section-title')
  .forEach(el => revealObserver.observe(el));

const countObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = parseInt(el.textContent);
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 40));
    const tick = () => {
      current = Math.min(current + step, target);
      el.textContent = current + '+';
      if (current < target) requestAnimationFrame(tick);
    };
    tick();
    countObserver.unobserve(el);
  });
}, { threshold: 0.6 });

document.querySelectorAll('.stat-card .num')
  .forEach(el => countObserver.observe(el));

const barObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const bar = entry.target;
    const width = bar.style.width;
    bar.style.width = '0%';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => { bar.style.width = width; });
    });
    barObserver.unobserve(bar);
  });
}, { threshold: 0.4 });

document.querySelectorAll('.skill-progress-fill, .widget-metric-bar')
  .forEach(el => barObserver.observe(el));

document.querySelectorAll('.hero__cta, .submit-btn').forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const r = btn.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
  });
  btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
});

setTimeout(() => {
  if (breathGuide) {
    breathGuide.classList.add('is-in');
  }
}, 1500);


// ─────── 4. Breathing Orb Phase Cycler ───────
const breathPhase = document.getElementById('breathPhase');
const phases = [
  { text: 'inhale', duration: 3500 },
  { text: 'hold', duration: 1000 },
  { text: 'exhale', duration: 3500 }
];
let currentPhaseIndex = 0;

function cycleBreathing() {
  if (!breathPhase) return;
  const phase = phases[currentPhaseIndex];
  breathPhase.textContent = phase.text;
  
  setTimeout(() => {
    currentPhaseIndex = (currentPhaseIndex + 1) % phases.length;
    cycleBreathing();
  }, phase.duration);
}
cycleBreathing();


// ─────── 5. Leaflet GIS Map Styling ───────
const mapContainer = document.getElementById('egypt-map');
let map = null;
let darkTiles = null;
let lightTiles = null;

if (mapContainer) {
  map = L.map('egypt-map', {
    scrollWheelZoom: false
  }).setView([30.0444, 31.2357], 6);

  darkTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 20
  });

  lightTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 20
  });

  if (savedTheme === 'dark') {
    darkTiles.addTo(map);
  } else {
    lightTiles.addTo(map);
  }

  const pulseIcon = L.divIcon({
    html: `
      <div style="position: relative; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 30px; height: 30px; border-radius: 50%; background-color: var(--terracotta); opacity: 0.25; animation: marker-pulse 2s infinite;"></div>
        <div style="position: absolute; width: 12px; height: 12px; border-radius: 50%; background-color: var(--terracotta); border: 2px solid var(--cream-bright); box-shadow: 0 0 8px rgba(44,38,32,0.15);"></div>
      </div>
      <style>
        @keyframes marker-pulse {
          0% { transform: scale(0.4); opacity: 0.8; }
          100% { transform: scale(1.6); opacity: 0; }
        }
      </style>
    `,
    className: 'custom-leaflet-pulse-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });

  const marker = L.marker([30.0444, 31.2357], { icon: pulseIcon }).addTo(map);
  marker.bindPopup(`
    <div style="font-family: 'Inter', 'Cairo', sans-serif; font-size: 0.82rem; padding: 4px; line-height: 1.4; color: var(--ink);">
      <strong style="color: var(--terracotta); display: block; margin-bottom: 2px; font-family: 'Fraunces', serif; font-size: 0.95rem;">Ahmed Elmorsy</strong>
      <span style="color: var(--ink-soft); display: block; margin-bottom: 4px; font-weight: 400;">GIS Analyst &amp; Spatial AI Specialist</span>
      <span style="display: flex; align-items: center; gap: 4px; font-weight: 500; color: var(--ink-mute);">
        <i class="ti ti-map-pin"></i> Cairo, Egypt
      </span>
    </div>
  `).openPopup();
}

function updateMapTiles(theme) {
  if (!map) return;
  if (theme === 'dark') {
    map.removeLayer(lightTiles);
    darkTiles.addTo(map);
  } else {
    map.removeLayer(darkTiles);
    lightTiles.addTo(map);
  }
}


// ─────── 6. Contact Form Submission (Netlify Forms Support) ───────
const contactForm = document.getElementById('contact-form');
const formFeedback = document.getElementById('form-feedback');

if (contactForm && formFeedback) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(contactForm);
    
    // Send form data asynchronously to Netlify
    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(formData).toString()
    })
      .then(() => {
        console.log('Geospatial message query logged successfully to Netlify.');
        formFeedback.textContent = "Message sent successfully! Thank you for reaching out.";
        formFeedback.style.display = 'block';
        contactForm.reset();
      })
      .catch((error) => {
        console.error('Netlify form submission error:', error);
        formFeedback.textContent = "Oops! Something went wrong. Please try sending your message again.";
        formFeedback.style.display = 'block';
      })
      .finally(() => {
        // Auto-hide feedback after 5 seconds
        setTimeout(() => {
          formFeedback.style.display = 'none';
        }, 5000);
      });
  });
}


// ─────── 7. Scroll Spy & Active Nav Highlight ───────
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav a');

window.addEventListener('scroll', () => {
  let currentActiveSectionId = '';
  const scrollOffset = window.scrollY + 150;

  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;

    if (scrollOffset >= sectionTop && scrollOffset < (sectionTop + sectionHeight)) {
      currentActiveSectionId = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${currentActiveSectionId}`) {
      link.classList.add('active');
    }
  });
});


// ─────── 8. Project Category Filtering Engine ───────
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const filter = btn.getAttribute('data-filter');

    // Update active filter button state
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Filter project cards with fade transition
    projectCards.forEach(card => {
      const category = card.getAttribute('data-category');
      
      if (filter === 'all' || category === filter) {
        card.style.display = 'block';
        requestAnimationFrame(() => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        });
      } else {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
          if (card.style.opacity === '0') {
            card.style.display = 'none';
          }
        }, 300);
      }
    });
  });
});


// ─────── 9. Interactive PDF Preview Modal Handler ───────
const pdfModal = document.getElementById('pdfModal');
const pdfModalBackdrop = document.getElementById('pdfModalBackdrop');
const pdfModalClose = document.getElementById('pdfModalClose');
const pdfModalTitle = document.getElementById('pdfModalTitle');
const pdfModalDownload = document.getElementById('pdfModalDownload');
const pdfModalIframe = document.getElementById('pdfModalIframe');
const previewBtns = document.querySelectorAll('.preview-btn');

function openPdfModal(pdfUrl, title) {
  if (!pdfModal) return;
  
  pdfModalIframe.src = pdfUrl;
  pdfModalTitle.textContent = title || 'Document Preview';
  pdfModalDownload.href = pdfUrl;
  
  pdfModal.classList.add('is-open');
  pdfModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closePdfModal() {
  if (!pdfModal) return;
  
  pdfModal.classList.remove('is-open');
  pdfModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  
  // Clear src after transition to stop PDF loading in background
  setTimeout(() => {
    if (!pdfModal.classList.contains('is-open')) {
      pdfModalIframe.src = '';
    }
  }, 350);
}

previewBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const pdfUrl = btn.getAttribute('data-pdf');
    const title = btn.getAttribute('data-title');
    if (pdfUrl) {
      openPdfModal(pdfUrl, title);
    }
  });
});

if (pdfModalClose) pdfModalClose.addEventListener('click', closePdfModal);
if (pdfModalBackdrop) pdfModalBackdrop.addEventListener('click', closePdfModal);

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && pdfModal && pdfModal.classList.contains('is-open')) {
    closePdfModal();
  }
});

// ─────── 10. Toggleable Case Study Drawer Handler ───────
document.querySelectorAll('.toggle-case-study-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const targetId = btn.getAttribute('data-target');
    const targetEl = document.querySelector(targetId);
    if (!targetEl) return;
    
    const isArabic = currentLang === 'ar';
    const isHidden = targetEl.style.display === 'none' || getComputedStyle(targetEl).display === 'none';
    if (isHidden) {
      targetEl.style.display = 'block';
      document.querySelectorAll(`.toggle-case-study-btn[data-target="${targetId}"]`).forEach(b => {
        const textSpan = b.querySelector('.btn-text');
        if (textSpan) textSpan.textContent = isArabic ? 'إخفاء دراسة الحالة' : 'Collapse Case Study';
        const icon = b.querySelector('i');
        if (icon) icon.className = 'ti ti-chevron-up';
      });
    } else {
      targetEl.style.display = 'none';
      document.querySelectorAll(`.toggle-case-study-btn[data-target="${targetId}"]`).forEach(b => {
        const textSpan = b.querySelector('.btn-text');
        if (textSpan) textSpan.textContent = isArabic ? 'عرض دراسة الحالة' : 'View Case Study';
        const icon = b.querySelector('i');
        if (icon) icon.className = 'ti ti-layout-sidebar-right-expand';
      });
    }
  });
});


