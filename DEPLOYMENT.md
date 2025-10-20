# دليل رفع المشروع على Netlify

## المتطلبات الأساسية
- حساب على [Netlify](https://www.netlify.com/)
- حساب GitHub أو GitLab (اختياري - للنشر التلقائي)
- مفتاح API من Mistral AI

## خطوات الرفع

### 1. إعداد المشروع محليًا
```bash
# تأكد من أن جميع الملفات موجودة
ls -la

# يجب أن ترى:
# - netlify.toml
# - runtime.txt
# - static/
# - netlify/functions/
```

### 2. الرفع عبر Netlify CLI (الطريقة الأولى)

#### تثبيت Netlify CLI
```bash
npm install -g netlify-cli
```

#### تسجيل الدخول
```bash
netlify login
```

#### النشر
```bash
# نشر تجريبي
netlify deploy

# نشر إنتاجي
netlify deploy --prod
```

### 3. الرفع عبر واجهة Netlify (الطريقة الثانية)

#### 3.1 إنشاء مستودع Git
```bash
git init
git add .
git commit -m "Initial commit for Netlify deployment"
```

#### 3.2 رفع إلى GitHub
```bash
# إنشاء مستودع جديد على GitHub أولاً
git remote add origin https://github.com/YOUR_USERNAME/arabic-ocr.git
git branch -M main
git push -u origin main
```

#### 3.3 ربط Netlify بـ GitHub
1. سجل الدخول إلى [Netlify](https://app.netlify.com/)
2. اضغط على "New site from Git"
3. اختر GitHub واختر المستودع
4. تأكد من الإعدادات التالية:
   - **Build command**: `echo 'Build completed'`
   - **Publish directory**: `static`
5. اضغط على "Deploy site"

### 4. الرفع المباشر عبر واجهة Netlify (الطريقة الثالثة)

1. سجل الدخول إلى [Netlify](https://app.netlify.com/)
2. اسحب وأسقط مجلد المشروع بالكامل في منطقة "Drop"
3. سيتم نشر الموقع تلقائيًا

### 5. إعداد متغيرات البيئة

#### عبر واجهة Netlify:
1. اذهب إلى Site settings → Environment variables
2. أضف المتغيرات التالية:
   - `MISTRAL_API_KEY`: مفتاح API من Mistral AI

#### عبر CLI:
```bash
netlify env:set MISTRAL_API_KEY "your_mistral_api_key_here"
```

### 6. اختبار الموقع

بعد النشر، ستحصل على رابط مثل:
```
https://your-site-name.netlify.app
```

قم بزيارة الرابط واختبر:
- صفحة الهبوط: `/landing.html`
- صفحة التطبيق: `/index.html`
- رفع ملف واستخراج النص

### 7. تخصيص النطاق (اختياري)

في إعدادات الموقع على Netlify:
1. اذهب إلى Domain settings
2. يمكنك:
   - تغيير اسم النطاق الفرعي (`your-name.netlify.app`)
   - إضافة نطاق مخصص (`yourdomain.com`)

## الملفات المهمة

### `netlify.toml`
ملف التكوين الرئيسي لـ Netlify:
- يحدد مجلد النشر (`static`)
- يعيد توجيه طلبات API إلى Functions
- يحدد إعدادات الأمان والـ Headers

### `netlify/functions/`
مجلد Functions (Serverless):
- `upload.py`: معالجة رفع الملفات
- `process-ocr.py`: معالجة OCR
- `requirements.txt`: مكتبات Python المطلوبة

### `static/`
الملفات الثابتة:
- HTML, CSS, JavaScript
- الصور والأيقونات

## استكشاف الأخطاء

### خطأ في Functions
```bash
# عرض السجلات
netlify functions:log
```

### مشاكل البناء
- تحقق من السجلات في Netlify Dashboard
- تأكد من وجود جميع الملفات المطلوبة

### مشاكل API
- تحقق من صحة `MISTRAL_API_KEY`
- راجع سجلات Functions

## الأوامر المفيدة

```bash
# عرض معلومات الموقع
netlify status

# فتح لوحة التحكم
netlify open

# عرض السجلات
netlify logs

# اختبار Functions محليًا
netlify dev
```

## ملاحظات مهمة

1. **حد الاستخدام المجاني**:
   - Netlify: 100 GB نقل بيانات/شهر
   - 125,000 طلب Functions/شهر
   - 100 ساعة بناء/شهر

2. **الأمان**:
   - لا تضع `MISTRAL_API_KEY` في الكود
   - استخدم متغيرات البيئة دائمًا

3. **الأداء**:
   - Functions لها حد زمني (10 ثوانٍ للخطة المجانية)
   - للملفات الكبيرة، قد تحتاج إلى خطة مدفوعة

## الدعم

- [وثائق Netlify](https://docs.netlify.com/)
- [وثائق Netlify Functions](https://docs.netlify.com/functions/overview/)
- [مجتمع Netlify](https://answers.netlify.com/)

## الترخيص

هذا المشروع مفتوح المصدر ومتاح للاستخدام الشخصي والتجاري.
