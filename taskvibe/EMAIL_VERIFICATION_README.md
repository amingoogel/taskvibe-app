# سیستم تایید ایمیل TaskVibe

## توضیحات
این سیستم تایید ایمیل برای ثبت نام کاربران در TaskVibe پیاده‌سازی شده است. کاربران باید ایمیل خود را تایید کنند قبل از اینکه بتوانند حساب کاربری ایجاد کنند.

## ویژگی‌ها

### ✅ بررسی‌های امنیتی
- بررسی فرمت صحیح ایمیل
- بررسی عدم وجود ایمیل تکراری در سیستم
- توکن تایید امن و منحصر به فرد
- انقضای توکن پس از ۲۴ ساعت
- حذف خودکار توکن‌های منقضی شده

### 📧 ارسال ایمیل
- قالب HTML زیبا و ریسپانسیو
- پشتیبانی از زبان فارسی
- لینک تایید مستقیم
- ارسال ایمیل از طریق SMTP Gmail

### 🔄 فرآیند ثبت نام
1. **مرحله اول**: ورود نام کاربری و ایمیل
2. **مرحله دوم**: ارسال لینک تایید و کلیک روی آن
3. **مرحله سوم**: تکمیل ثبت نام با رمز عبور

## API Endpoints

### ارسال لینک تایید
```
POST /api/send-verification/
```
**پارامترها:**
- `email`: ایمیل کاربر

**پاسخ موفق:**
```json
{
  "message": "لینک تایید به ایمیل شما ارسال شد",
  "email": "user@example.com"
}
```

### تایید ایمیل (GET)
```
GET /api/verify-email/?token={token}&email={email}
```
**پارامترها:**
- `token`: توکن تایید
- `email`: ایمیل کاربر

**پاسخ موفق:**
```json
{
  "message": "ایمیل با موفقیت تایید شد",
  "email": "user@example.com"
}
```

### ثبت نام نهایی
```
POST /api/register/
```
**پارامترها:**
- `username`: نام کاربری
- `email`: ایمیل تایید شده
- `password`: رمز عبور

## مدل داده‌ها

### EmailVerification
```python
class EmailVerification(models.Model):
    email = models.EmailField()
    token = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)
```

## تنظیمات ایمیل

در فایل `settings.py`:
```python
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-email@gmail.com'
EMAIL_HOST_PASSWORD = 'your-app-password'
DEFAULT_FROM_EMAIL = 'TaskVibe <your-email@gmail.com>'
```

## قالب ایمیل

قالب ایمیل در `templates/email/verification_email.html` قرار دارد و شامل:
- طراحی ریسپانسیو
- پشتیبانی از RTL
- استایل‌های زیبا
- پیام‌های فارسی

## تست سیستم

برای تست سیستم:
```bash
python test_email_verification.py
```

## نکات مهم

1. **امنیت**: توکن‌های تایید پس از ۲۴ ساعت منقضی می‌شوند
2. **پاکسازی**: توکن‌های قدیمی به صورت خودکار حذف می‌شوند
3. **تکرار**: هر ایمیل فقط یک توکن فعال در هر زمان می‌تواند داشته باشد
4. **اعتبارسنجی**: فرمت ایمیل و عدم تکرار بررسی می‌شود
5. **کاربرپسندی**: کاربر با کلیک روی لینک ایمیلش را تایید می‌کند

## مشکلات احتمالی

### خطا در ارسال ایمیل
- بررسی تنظیمات SMTP
- بررسی App Password در Gmail
- بررسی فایروال و پورت 587

### لینک تایید نامعتبر
- بررسی انقضای توکن (۲۴ ساعت)
- بررسی صحت توکن
- بررسی تایید شدن توکن

## بهبودهای آینده

- [ ] ارسال مجدد کد تایید
- [ ] محدودیت تعداد درخواست‌ها
- [ ] پشتیبانی از SMS
- [ ] لاگ کردن درخواست‌ها 