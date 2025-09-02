# TaskVibe

TaskVibe یک اپلیکیشن مدیریت وظایف روزانه با ویژگی‌های خاص مثل پیشنهاد هوشمند (با scikit-learn)، مدیریت انرژی، حال و هوا، چالش‌های اجتماعی، عکس روز، و گزارش‌های تحلیلی. بک‌اند با Django + DRF و فرانت‌اند با React + Tailwind CSS ساخته شده.

## ویژگی‌ها
- مدیریت وظایف با تقویم تعاملی
- پیشنهاد هوشمند وظایف با یادگیری ماشین
- آپلود عکس روز و ثبت حال و هوا
- چالش‌های اجتماعی با WebSocket
- گزارش‌های روزانه با نمودارها
- اعلان‌های ایمیلی

## ساختار پروژه
- `backend/`: بک‌اند Django
- `frontend/`: فرانت‌اند React

## راه‌اندازی بک‌اند
1. به `backend/` برو: `cd backend`
2. محیط مجازی بساز: `python -m venv venv`
3. فعال کن: `source venv/bin/activate` (لینوکس/مک) یا `venv\Scripts\activate` (ویندوز)
4. وابستگی‌ها رو نصب کن: `pip install -r requirements.txt`
5. مهاجرت‌ها رو اعمال کن: `python manage.py makemigrations && python manage.py migrate`
6. سوپرادمین بساز: `python manage.py createsuperuser`
7. سرور رو اجرا کن: `python manage.py runserver`

## راه‌اندازی فرانت‌اند
1. به `frontend/` برو: `cd frontend`
2. وابستگی‌ها رو نصب کن: `npm install`
3. سرور رو اجرا کن: `npm start`

## تنظیمات اضافی
- برای Redis (WebSocket): `redis-server` رو اجرا کن.
- برای ایمیل: در `backend/taskvibe/settings.py` ایمیل و رمز اپلیکیشن رو تنظیم کن.
- دیتابیس: PostgreSQL رو تنظیم کن (در settings.py).

## لایسنس
MIT License