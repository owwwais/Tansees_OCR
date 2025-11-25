# هيكل المشروع

## نظرة عامة

```
arabic OCR/
├── static/                      # الملفات الثابتة (HTML, CSS, JS)
│   ├── _redirects              # إعادة توجيه Netlify
│   ├── index.html              # صفحة التطبيق الرئيسية
│   ├── landing.html            # صفحة الهبوط
│   ├── about.html              # صفحة من نحن
│   ├── privacy.html            # صفحة سياسة الخصوصية
│   ├── script.js               # كود JavaScript الرئيسي
│   └── style.css               # ملف التنسيقات
│
├── netlify/                     # Netlify Serverless Functions
│   └── functions/
│       ├── upload.py           # Function لرفع الملفات
│       ├── process-ocr.py      # Function لمعالجة OCR
│       └── requirements.txt    # مكتبات Python
│
├── netlify.toml                # ملف تكوين Netlify
├── runtime.txt                 # إصدار Python
├── .gitignore                  # ملفات يتم تجاهلها في Git
├── package.json                # تكوين npm
├── requirements.txt            # مكتبات Python للمشروع
├── .env                        # متغيرات البيئة (محلي فقط)
│
├── DEPLOYMENT.md               # دليل الرفع التفصيلي
├── NETLIFY_QUICK_START.md      # دليل سريع للرفع
├── PROJECT_STRUCTURE.md        # هذا الملف
└── README.md                   # ملف README الرئيسي
```

## وصف المجلدات والملفات

### 📁 `static/`
يحتوي على جميع الملفات التي سيتم نشرها على Netlify:

- **`index.html`**: صفحة التطبيق الرئيسية حيث يتم رفع الملفات ومعالجتها
- **`landing.html`**: صفحة الهبوط الأولى التي يراها الزوار
- **`about.html`**: صفحة معلومات عن المشروع
- **`privacy.html`**: صفحة سياسة الخصوصية
- **`script.js`**: كود JavaScript لمعالجة الأحداث والتفاعل مع API
- **`style.css`**: تنسيقات CSS للموقع
- **`_redirects`**: قواعد إعادة التوجيه لـ Netlify

### 📁 `netlify/functions/`
يحتوي على Serverless Functions التي تعمل على خوادم Netlify:

#### `upload.py`
- **الوظيفة**: معالجة رفع الملفات من المستخدم
- **المدخلات**: ملف (صورة أو PDF)
- **المخرجات**: تأكيد الرفع واسم الملف
- **الطريقة**: POST

#### `process-ocr.py`
- **الوظيفة**: استخراج النص من الملفات باستخدام Mistral AI
- **المدخلات**: اسم الملف
- **المخرجات**: النص المستخرج
- **الطريقة**: POST

#### `requirements.txt`
- مكتبة `mistralai` لاستخدام Mistral AI API

### 📄 ملفات التكوين

#### `netlify.toml`
ملف التكوين الرئيسي لـ Netlify:

```toml
[build]
  publish = "static"              # المجلد المراد نشره
  command = "echo 'Build completed'"

[build.environment]
  PYTHON_VERSION = "3.13"         # إصدار Python

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"  # توجيه API إلى Functions
  status = 200
```

**الإعدادات الرئيسية**:
- `publish`: يحدد مجلد النشر (`static`)
- `redirects`: يعيد توجيه `/api/*` إلى Functions
- `headers`: إعدادات الأمان والتخزين المؤقت

#### `runtime.txt`
يحدد إصدار Python المستخدم:
```
3.13
```

#### `.gitignore`
يحدد الملفات التي يجب تجاهلها في Git:
- ملفات Python المؤقتة (`__pycache__`)
- متغيرات البيئة (`.env`)
- مجلدات البناء
- الملفات المرفوعة

#### `package.json`
ملف تكوين npm للمشروع:
- يحتوي على أوامر للتطوير والنشر
- يتطلب `netlify-cli` للتطوير المحلي

## سير العمل (Workflow)

### 1. المستخدم يرفع ملف
```
المستخدم → index.html → script.js → /api/upload → netlify/functions/upload.py
```

### 2. معالجة OCR
```
script.js → /api/process-ocr → netlify/functions/process-ocr.py → Mistral AI API
```

### 3. عرض النتائج
```
process-ocr.py → script.js → عرض في index.html
```

## متغيرات البيئة

### محلي (`.env`)
```env
MISTRAL_API_KEY=your_api_key_here
```

### على Netlify
يجب إضافتها في: Site settings → Environment variables
- `MISTRAL_API_KEY`: مفتاح API من Mistral

## الملفات التي لا تُنشر

الملفات التالية موجودة محليًا فقط ولا يتم نشرها:
- `.env` (متغيرات البيئة المحلية)
- `main.py` (خادم FastAPI المحلي - غير مستخدم في Netlify)
- `uploads/` (مجلد الملفات المؤقتة)
- `__pycache__/` (ملفات Python المترجمة)

## كيفية إضافة ميزة جديدة

### إضافة Function جديدة:

1. أنشئ ملف Python في `netlify/functions/`:
```python
# netlify/functions/new-feature.py
import json

def handler(event, context):
    return {
        'statusCode': 200,
        'body': json.dumps({'message': 'Hello'})
    }
```

2. حدّث `script.js` لاستدعاء Function:
```javascript
const response = await fetch('/api/new-feature', {
    method: 'POST'
});
```

3. Function ستكون متاحة تلقائيًا على `/api/new-feature`

### إضافة صفحة جديدة:

1. أنشئ ملف HTML في `static/`:
```html
<!-- static/new-page.html -->
<!DOCTYPE html>
<html>
...
</html>
```

2. أضف رابط في القائمة:
```html
<a href="new-page.html">الصفحة الجديدة</a>
```

## الموارد

- [Netlify Functions Documentation](https://docs.netlify.com/functions/overview/)
- [Netlify Redirects Documentation](https://docs.netlify.com/routing/redirects/)
- [Mistral AI Documentation](https://docs.mistral.ai/)

---

**آخر تحديث**: 2024
