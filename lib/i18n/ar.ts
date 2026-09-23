import { Translations } from './types';

export const ar: Translations = {
  appName: 'نظام إرسال الرواتب',
  appTagline: 'إرسال بيانات الرواتب للموظفين تلقائياً عبر واتساب كلاود',
  metaBadge: 'أتمتة الأعمال عبر Meta WhatsApp Cloud API',
  chooseModuleTitle: 'اختر وحدة إرسال الرواتب',
  chooseModuleDesc: 'حدد نوع كشف الرواتب المطلوب إرساله للبدء في رفع الملف ومطابقة البيانات وإرسال الإشعارات.',

  // Modules
  weeklyModuleTitle: 'البيان الأسبوعي',
  weeklyModuleSub: 'Send Weekly Statement',
  weeklyModuleDesc: 'رفع كشف الرواتب الأسبوعي ومطابقة 16 بنداً للأجور والحوافز وإرسال قالب الواتساب الأسبوعي المعتمد.',
  weeklyBadge: 'دورة أسبوعية',
  openWeeklyBtn: 'فتح الوحدة الأسبوعية',

  monthlyModuleTitle: 'البيان الشهري',
  monthlyModuleSub: 'Send Monthly Statement',
  monthlyModuleDesc: 'رفع كشف مفردات المرتب الشهري ومطابقة 16 بنداً للاشتراكات والبدلات والأرصدة وإرسال القالب الشهري.',
  monthlyBadge: 'دورة شهرية',
  openMonthlyBtn: 'فتح الوحدة الشهرية',

  backToModules: 'العودة لاختيار الوحدة',
  switchModule: 'تبديل الوحدة',
  currentModule: 'الوحدة النشطة',

  // Header
  whatsappEngine: 'محرك واتساب:',
  cloudApiActive: 'متصل بالسحابة',
  credentialsMissing: 'غير مهيأ',
  langToggle: 'English',

  // Steps
  stepUpload: '1. رفع الملف',
  stepValidate: '2. التحقق من البيانات',
  stepReview: '3. مراجعة الموظفين',
  stepSend: '4. الإرسال',
  stepResults: '5. تقرير النتائج',

  // Upload
  uploadTitle: 'رفع ملف إكسيل للرواتب',
  uploadDescWeekly: 'قم برفع ملف إكسيل للبيان الأسبوعي لاستخراج بيانات الموظفين ومطابقة الـ 16 بنداً تلقائياً.',
  uploadDescMonthly: 'قم برفع ملف إكسيل لمفردات المرتب الشهري لاستخراج البيانات ومطابقة الـ 16 بنداً تلقائياً.',
  dropzoneTitle: 'اسحب وأفلت ملف الإكسيل هنا، أو تصفح جهازك',
  dropzoneSub: 'يدعم صيغ الملفات .xlsx و .xls',
  selectFileBtn: 'اختيار ملف من الجهاز',
  parsingFile: 'جاري فحص ومطابقة الملف...',
  downloadWeeklySample: 'تحميل نموذج أسبوعي جاهز',
  downloadMonthlySample: 'تحميل نموذج شهري جاهز',
  fileLoaded: 'تم تحميل الملف بنجاح',
  recordsParsed: 'تمت قراءة وفحص سجلات الموظفين بنجاح',
  uploadDifferentFile: 'رفع ملف آخر',
  invalidFileFormat: 'صيغة الملف غير مدعومة. يرجى رفع ملف إكسيل بصيغة .xlsx أو .xls.',

  // Table & Toolbar
  payrollPreviewTitle: 'معاينة كشف الرواتب',
  payrollPreviewDesc: 'راجع بيانات الموظفين وتأكد من صحة أرقام الهواتف والمبالغ قبل بدء الإرسال.',
  searchPlaceholder: 'بحث بالاسم، الكود، أو رقم الهاتف...',
  recordsCount: 'موظف',
  filterAll: 'الكل',
  filterReady: 'جاهز',
  filterSent: 'تم الإرسال',
  filterFailed: 'فشل',
  noMatchingRecords: 'لا توجد سجلات تطابق معايير البحث.',

  // Table Columns
  colIndex: '#',
  colName: 'اسم الموظف',
  colPhone: 'رقم الواتساب',
  colStatus: 'الحالة',
  colActions: 'الإجراءات',

  // Weekly Table Columns
  colWeek: 'الأسبوع',
  colMonth: 'الشهر',
  colSettlements: 'تسويات',
  colProduction: 'حافز الإنتاج',
  colTransport: 'بدل الانتقال',
  colSaturday: 'مبلغ السبت',
  colSaturdayDiff: 'فرق السبت',
  colEvening: 'مبلغ السهرات',
  colBonuses: 'مكافآت',
  colMeal: 'بدل وجبة',
  colEfficiency: 'حافز كفاءة',
  colRegularity: 'حافز انتظام',
  colGrant: 'منحة',
  colUnderAccount: 'تحت الحساب',
  colTotal: 'الإجمالي',

  // Monthly Table Columns
  colPeriod: 'فترة الراتب',
  colSubWage: 'أجر الاشتراك',
  colCompWage: 'الأجر الشامل',
  colMonthlyItem: 'بند الشهر',
  colCostOfLiving: 'غلاء المعيشة',
  colWorkerIncentive: 'حافز العامل',
  colAbsence: 'الغياب',
  colTax: 'الضريبة',
  colGross: 'إجمالي الراتب',
  colNetSalary: 'صافي الراتب',
  colAdvance: 'السلفة',
  colHousing: 'السكن',
  colRemainingAdvance: 'باقي السلفة',
  colLeaveBalance: 'رصيد الإجازات',
  colCasualBalance: 'رصيد العارضة',

  // Statuses
  statusReady: 'جاهز',
  statusSending: 'جاري الإرسال',
  statusSent: 'تم الإرسال',
  statusFailed: 'فشل',

  // Actions
  actionSend: 'إرسال',
  actionRetry: 'إعادة المحاولة',
  actionPreview: 'معاينة',
  actionSendAll: 'إرسال الكل',
  actionSendingAll: 'جاري الإرسال...',

  // Validation
  validationTitle: 'تنبيهات تدقيق البيانات',
  blockingErrors: 'خطأ يمنع الإرسال',
  warnings: 'تحذير تدقيق',
  hideDetails: 'إخفاء التفاصيل',
  showDetails: 'عرض التفاصيل',
  rowLabel: 'الصف',
  fileHeaderLabel: 'أعمدة الملف',

  // Confirmation Modal
  confirmBatchTitle: 'تأكيد إرسال الدفعة الكاملة',
  confirmBatchDesc: 'هل أنت متأكد من رغبتك في إرسال رسائل بيان الراتب عبر واتساب لجميع الموظفين المحددين؟',
  confirmSingleTitle: 'تأكيد الإرسال الفردي',
  confirmSingleDesc: 'هل أنت متأكد من رغبتك في إرسال بيان الراتب للموظف المحدد؟',
  confirmRetryTitle: 'تأكيد إعادة إرسال الرسائل الفاشلة',
  confirmRetryDesc: 'هل تريد إعادة محاولة الإرسال للسجلات التي لم يتم تسليمها سابقاً؟',
  confirmModalModule: 'الوحدة المحددة:',
  confirmModalCount: 'عدد الموظفين المستهدفين:',
  confirmModalTemplate: 'قالب واتساب المستخدم:',
  confirmModalNotice: 'سيتم إرسال كل رسالة بشكل مستقل إلى رقم الواتساب المعتمد للموظف. لا يمكن التراجع بعد بدء الإرسال.',
  btnCancel: 'إلغاء',
  btnConfirmSend: 'تأكيد وبدء الإرسال',
  btnConfirmRetry: 'إعادة إرسال الفاشل',

  // Message Preview Modal
  previewModalTitle: 'معاينة رسالة الواتساب',
  previewModalBadge: 'رسالة أعمال مشفرة من طرف لطرف عبر Meta',
  previewModalFooter: 'القالب معتمد ومربوط بـ 16 متغيراً رسمياً بحسب متطلبات Meta Cloud API',
  previewModalClose: 'إغلاق المعاينة',
  previewTemplateNotice: 'معاينة طبق الأصل لما سيتسلمه الموظف على هاتفه:',

  // Progress Tracker
  sendingInProgress: 'جاري إرسال بيانات الرواتب عبر واتساب',
  sendingTo: 'جاري الإرسال حالياً إلى:',
  processedOf: 'تمت معالجة',
  statTotal: 'الإجمالي',
  statRemaining: 'المتبقي',
  statCurrent: 'جاري إرساله',
  statSent: 'تم بنجاح',
  statFailed: 'فشل',

  // Results Summary
  resultsCompletedTitle: 'اكتملت عملية إرسال الرواتب',
  resultsCompletedDesc: 'تم الانتهاء من معالجة وإرسال الرسائل للموظفين المستهدفين عبر محرك واتساب كلاود.',
  retryOnlyFailed: 'إعادة إرسال الفاشل فقط',
  exportCsv: 'تصدير تقرير التدقيق (.csv)',
  startNewUpload: 'رفع ملف جديد',
  statTotalEmp: 'إجمالي الموظفين',
  statSuccessDeliveries: 'تم تسليمها بنجاح',
  statFailedDeliveries: 'فشل التسليم',
  statSuccessRate: 'نسبة النجاح',
  executionLog: 'سجل تفاصيل الإرسال',
  engineMode: 'وضع المحرك:',
  deliveredBadge: 'تم التسليم',
  failedBadge: 'فشل الإرسال',

  // Footer
  footerCopyright: '© 2026 نظام إرسال الرواتب HR — منظومة أتمتة الأعمال الإدارية',
  footerOfficial: 'نظام متوافق مع Meta WhatsApp Business Cloud API',
  currencyEgp: 'ج.م',
};
