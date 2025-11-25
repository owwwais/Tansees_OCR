from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse
import uvicorn
import os
import base64
import json
import asyncio
from typing import Optional, Dict, Any
import logging
from dotenv import load_dotenv
from mistralai import Mistral
from PIL import Image
import io

# تحميل متغيرات البيئة
load_dotenv()

# إعداد التسجيل
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# إعداد Mistral AI
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
if not MISTRAL_API_KEY or MISTRAL_API_KEY == "your_mistral_api_key_here":
    logger.warning("MISTRAL_API_KEY غير محدد أو غير صحيح. سيتم استخدام وضع المحاكاة للاختبار.")
    MISTRAL_API_KEY = None
    client = None
else:
    client = Mistral(api_key=MISTRAL_API_KEY)

app = FastAPI(
    title="Arabic OCR Web Application",
    description="تطبيق OCR احترافي يدعم العربية والإنجليزية",
    version="1.0.0"
)

# إعداد الملفات الثابتة
app.mount("/static", StaticFiles(directory="static"), name="static")

# مجلد للملفات المؤقتة
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

@app.get("/", response_class=HTMLResponse)
async def read_root():
    """الصفحة الرئيسية للتطبيق - توجيه إلى صفحة الهبوط"""
    with open("static/landing.html", "r", encoding="utf-8") as f:
        return HTMLResponse(content=f.read())

@app.get("/landing.html", response_class=HTMLResponse)
async def landing_page():
    """صفحة الهبوط"""
    with open("static/landing.html", "r", encoding="utf-8") as f:
        return HTMLResponse(content=f.read())

@app.get("/index.html", response_class=HTMLResponse)
async def app_page():
    """صفحة التطبيق الرئيسية"""
    with open("static/index.html", "r", encoding="utf-8") as f:
        return HTMLResponse(content=f.read())

@app.get("/about.html", response_class=HTMLResponse)
async def about_page():
    """صفحة من نحن"""
    with open("static/about.html", "r", encoding="utf-8") as f:
        return HTMLResponse(content=f.read())

@app.get("/privacy.html", response_class=HTMLResponse)
async def privacy_page():
    """صفحة سياسة الخصوصية"""
    with open("static/privacy.html", "r", encoding="utf-8") as f:
        return HTMLResponse(content=f.read())

@app.get("/tansees_logo.svg")
async def tansees_logo():
    """شعار تنصيص"""
    from fastapi.responses import FileResponse
    return FileResponse("static/tansees_logo.svg", media_type="image/svg+xml")

@app.get("/owwwais_logo.svg")
async def owwwais_logo():
    """شعار المطور"""
    from fastapi.responses import FileResponse
    return FileResponse("static/owwwais_logo.svg", media_type="image/svg+xml")

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """رفع ملف للمعالجة"""
    try:
        # التحقق من نوع الملف
        allowed_types = ["application/pdf", "image/png", "image/jpeg", "image/jpg"]
        if file.content_type not in allowed_types:
            raise HTTPException(status_code=400, detail="نوع الملف غير مدعوم")
        
        # حفظ الملف
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        logger.info(f"تم رفع الملف: {file.filename}")
        return {"filename": file.filename, "status": "uploaded"}
    
    except Exception as e:
        logger.error(f"خطأ في رفع الملف: {str(e)}")
        raise HTTPException(status_code=500, detail="خطأ في رفع الملف")

@app.post("/process-ocr")
async def process_ocr(filename: str = Form(...)):
    """معالجة OCR للملف"""
    try:
        file_path = os.path.join(UPLOAD_DIR, filename)
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="الملف غير موجود")
        
        logger.info(f"بدء معالجة OCR للملف: {filename}")
        
        # معالجة OCR باستخدام Mistral AI
        extracted_text = await perform_ocr(file_path)
        
        # تنظيف الملف بعد المعالجة
        try:
            os.remove(file_path)
            logger.info(f"تم حذف الملف المؤقت: {filename}")
        except Exception as e:
            logger.warning(f"فشل في حذف الملف المؤقت: {e}")
        
        return {
            "filename": filename,
            "status": "completed",
            "extracted_text": extracted_text,
            "message": "تم استخراج النص بنجاح"
        }
    
    except Exception as e:
        logger.error(f"خطأ في معالجة OCR: {str(e)}")
        raise HTTPException(status_code=500, detail=f"خطأ في معالجة OCR: {str(e)}")

async def perform_ocr(file_path: str) -> str:
    """تنفيذ OCR على الملف"""
    try:
        file_extension = os.path.splitext(file_path)[1].lower()
        
        if file_extension == '.pdf':
            return await process_pdf_ocr(file_path)
        elif file_extension in ['.png', '.jpg', '.jpeg']:
            return await process_image_ocr(file_path)
        else:
            raise ValueError(f"نوع الملف غير مدعوم: {file_extension}")
    
    except Exception as e:
        logger.error(f"خطأ في perform_ocr: {str(e)}")
        raise e

async def process_pdf_ocr(file_path: str) -> str:
    """معالجة OCR لملف PDF"""
    try:
        logger.info(f"معالجة PDF: {file_path}")
        
        # إذا لم يكن هناك API key صحيح، استخدم وضع المحاكاة
        if not client:
            logger.info("استخدام وضع المحاكاة للاختبار")
            await asyncio.sleep(2)  # محاكاة وقت المعالجة
            return simulate_ocr_result("PDF")
        
        # قراءة الملف كـ base64
        with open(file_path, "rb") as f:
            pdf_bytes = f.read()
        
        b64 = base64.b64encode(pdf_bytes).decode()
        
        # استدعاء Mistral OCR
        response = client.ocr.process(
            model="mistral-ocr-latest",
            document={
                "type": "document_url",
                "document_url": f"data:application/pdf;base64,{b64}"
            },
            include_image_base64=False
        )
        
        # تجميع النص من جميع الصفحات
        extracted_text = ""
        for page in response.pages:
            extracted_text += page.markdown + "\n\n"
        
        logger.info(f"تم استخراج {len(extracted_text)} حرف من PDF")
        return extracted_text.strip()
    
    except Exception as e:
        logger.error(f"خطأ في معالجة PDF: {str(e)}")
        if "401" in str(e) or "Unauthorized" in str(e):
            logger.warning("API key غير صحيح. استخدام وضع المحاكاة.")
            return simulate_ocr_result("PDF")
        raise e

def encode_image(image_path: str) -> Optional[str]:
    """تحويل الصورة إلى base64 مع معالجة محسنة للأخطاء"""
    try:
        # التحقق من وجود الملف أولاً
        if not os.path.exists(image_path):
            logger.error(f"خطأ: الملف {image_path} غير موجود.")
            return None
        
        # التحقق من حجم الملف
        file_size = os.path.getsize(image_path)
        logger.info(f"حجم الملف: {file_size} بايت")
        
        if file_size == 0:
            logger.error("خطأ: الملف فارغ")
            return None
        
        with open(image_path, "rb") as image_file:
            image_data = image_file.read()
            base64_data = base64.b64encode(image_data).decode('utf-8')
            logger.info(f"تم تحويل {len(base64_data)} حرف إلى base64")
            return base64_data
            
    except FileNotFoundError:
        logger.error(f"خطأ: الملف {image_path} غير موجود.")
        return None
    except PermissionError:
        logger.error(f"خطأ: لا توجد صلاحية لقراءة الملف {image_path}")
        return None
    except Exception as e:
        logger.error(f"خطأ في تحويل الصورة إلى base64: {type(e).__name__}: {e}")
        return None

async def process_image_ocr(file_path: str) -> str:
    """معالجة OCR للصورة باستخدام الطريقة المحسنة"""
    try:
        logger.info(f"معالجة الصورة: {file_path}")
        
        # إذا لم يكن هناك API key صحيح، استخدم وضع المحاكاة
        if not client:
            logger.info("استخدام وضع المحاكاة للاختبار")
            await asyncio.sleep(2)  # محاكاة وقت المعالجة
            return simulate_ocr_result("صورة")
        
        # تحويل الصورة إلى base64 باستخدام الدالة المحسنة
        logger.info("بدء تحويل الصورة إلى base64...")
        base64_image = encode_image(file_path)
        if not base64_image:
            logger.error("فشل في تحويل الصورة إلى base64")
            raise ValueError("فشل في تحويل الصورة إلى base64")
        logger.info("تم تحويل الصورة إلى base64 بنجاح")
        
        # تحديد نوع الصورة
        file_extension = os.path.splitext(file_path)[1].lower()
        mime_type = {
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg'
        }.get(file_extension, 'image/jpeg')
        
        # استدعاء Mistral OCR للصور باستخدام الطريقة الصحيحة
        logger.info(f"بدء استدعاء Mistral OCR API للصورة بنوع: {mime_type}")
        
        try:
            # استخدام الطريقة الصحيحة كما في المثال الرسمي
            response = client.ocr.process(
                model="mistral-ocr-latest",
                document={
                    "type": "image_url",
                    "image_url": f"data:{mime_type};base64,{base64_image}"
                },
                include_image_base64=True
            )
            logger.info("تم استدعاء Mistral OCR API بنجاح")
            
        except Exception as api_error:
            logger.error(f"خطأ في استدعاء Mistral OCR API: {str(api_error)}")
            logger.error(f"تفاصيل الخطأ: {type(api_error).__name__}")
            raise api_error
        
        # التحقق من وجود response صحيح
        if not response:
            logger.error("لم يتم الحصول على استجابة صحيحة من API")
            raise ValueError("لم يتم الحصول على استجابة صحيحة من API")
        
        # تجميع النص من الاستجابة
        extracted_text = ""
        
        # طباعة بنية الاستجابة للتشخيص
        logger.info(f"نوع الاستجابة: {type(response)}")
        logger.info(f"خصائص الاستجابة: {dir(response)}")
        
        # محاولة استخراج النص بطرق مختلفة
        if hasattr(response, 'pages') and response.pages:
            logger.info(f"وُجدت {len(response.pages)} صفحة في الاستجابة")
            for i, page in enumerate(response.pages):
                logger.info(f"معالجة الصفحة {i+1}")
                if hasattr(page, 'markdown') and page.markdown:
                    extracted_text += page.markdown + "\n\n"
                elif hasattr(page, 'text') and page.text:
                    extracted_text += page.text + "\n\n"
                elif hasattr(page, 'content') and page.content:
                    extracted_text += str(page.content) + "\n\n"
                else:
                    logger.warning(f"الصفحة {i+1} لا تحتوي على نص")
                    logger.info(f"خصائص الصفحة {i+1}: {dir(page)}")
        
        elif hasattr(response, 'text') and response.text:
            logger.info("استخراج النص من خاصية text")
            extracted_text = response.text
        elif hasattr(response, 'content') and response.content:
            logger.info("استخراج النص من خاصية content")
            extracted_text = str(response.content)
        elif hasattr(response, 'markdown') and response.markdown:
            logger.info("استخراج النص من خاصية markdown")
            extracted_text = response.markdown
        else:
            logger.error("لم يتم العثور على نص في الاستجابة")
            logger.error(f"محتوى الاستجابة: {response}")
            extracted_text = "لم يتم العثور على نص في الصورة"
        
        logger.info(f"تم استخراج {len(extracted_text)} حرف من الصورة")
        return extracted_text.strip()
    
    except Exception as e:
        logger.error(f"خطأ في معالجة الصورة: {str(e)}")
        if "401" in str(e) or "Unauthorized" in str(e):
            logger.warning("API key غير صحيح. استخدام وضع المحاكاة.")
            return simulate_ocr_result("صورة")
        raise e

def simulate_ocr_result(file_type: str) -> str:
    """محاكاة نتيجة OCR للاختبار"""
    if file_type == "PDF":
        return """# محاكاة نتيجة OCR من ملف PDF

## العنوان الرئيسي
هذا نص محاكى لنتيجة OCR من ملف PDF. تم استخراج هذا النص باستخدام تقنية التعرف البصري على الحروف.

### الفقرة الأولى
هذا مثال على نص يمكن أن يستبدل في نفس المساحة، لقد تم توليد هذا النص من مولد النص العربى، حيث يمكنك أن تولد مثل هذا النص أو العديد من النصوص الأخرى إضافة إلى زيادة عدد الحروف التى يولدها التطبيق.

### الفقرة الثانية
إذا كنت تحتاج إلى عدد أكبر من الفقرات يتيح لك مولد النص العربى زيادة عدد الفقرات كما تريد، النص لن يبدو مقسماً ولا يحوي أخطاء لغوية، مولد النص العربى مفيد لمصممي المواقع على وجه الخصوص، حيث يحتاج العميل فى كثير من الأحيان أن يطلع على صورة حقيقية لتصميم الموقع.

### قائمة العناصر
- عنصر أول في القائمة
- عنصر ثاني في القائمة  
- عنصر ثالث في القائمة
- عنصر رابع في القائمة

### جدول البيانات
| العمود الأول | العمود الثاني | العمود الثالث |
|--------------|---------------|----------------|
| بيانات 1     | بيانات 2      | بيانات 3       |
| بيانات 4     | بيانات 5      | بيانات 6       |

### خاتمة
هذا النص هو مثال لنص يمكن أن يستبدل في نفس المساحة، لقد تم توليد هذا النص من مولد النص العربى، حيث يمكنك أن تولد مثل هذا النص أو العديد من النصوص الأخرى إضافة إلى زيادة عدد الحروف التى يولدها التطبيق."""
    
    else:  # صورة
        return """# محاكاة نتيجة OCR من صورة

## نص مستخرج من الصورة
هذا نص محاكى لنتيجة OCR من صورة. تم استخراج هذا النص باستخدام تقنية التعرف البصري على الحروف.

### محتوى الصورة
هذا مثال على نص يمكن أن يستبدل في نفس المساحة، لقد تم توليد هذا النص من مولد النص العربى، حيث يمكنك أن تولد مثل هذا النص أو العديد من النصوص الأخرى.

### معلومات إضافية
- نوع الملف: صورة
- دقة الصورة: عالية
- جودة النص المستخرج: ممتازة

### ملاحظات
هذا النص هو مثال لنص يمكن أن يستبدل في نفس المساحة، لقد تم توليد هذا النص من مولد النص العربى، حيث يمكنك أن تولد مثل هذا النص أو العديد من النصوص الأخرى إضافة إلى زيادة عدد الحروف التى يولدها التطبيق."""

@app.get("/test-ocr")
async def test_ocr():
    """اختبار بسيط لـ OCR"""
    try:
        # البحث عن صورة في مجلد uploads للاختبار
        if os.path.exists(UPLOAD_DIR):
            files = [f for f in os.listdir(UPLOAD_DIR) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
            if files:
                test_file = files[0]
                file_path = os.path.join(UPLOAD_DIR, test_file)
                logger.info(f"اختبار OCR على الملف: {test_file}")
                
                result = await perform_ocr(file_path)
                return {
                    "status": "success",
                    "test_file": test_file,
                    "extracted_text": result[:500] + "..." if len(result) > 500 else result,
                    "text_length": len(result)
                }
            else:
                return {"status": "no_test_files", "message": "لا توجد صور للاختبار في مجلد uploads"}
        else:
            return {"status": "no_upload_dir", "message": "مجلد uploads غير موجود"}
    except Exception as e:
        logger.error(f"خطأ في اختبار OCR: {str(e)}")
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
