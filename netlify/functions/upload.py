import json
import base64
import os
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Netlify Function لرفع الملفات
    """
    try:
        # التحقق من طريقة الطلب
        if event['httpMethod'] != 'POST':
            return {
                'statusCode': 405,
                'body': json.dumps({'error': 'Method not allowed'})
            }
        
        # معالجة الملف المرفوع
        body = event.get('body', '')
        is_base64 = event.get('isBase64Encoded', False)
        
        if is_base64:
            body = base64.b64decode(body)
        
        # إرجاع استجابة نجاح
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            'body': json.dumps({
                'filename': 'uploaded_file',
                'status': 'uploaded',
                'message': 'تم رفع الملف بنجاح'
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            'body': json.dumps({
                'error': str(e),
                'message': 'خطأ في رفع الملف'
            })
        }
