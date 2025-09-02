import os
import sys
import django

# افزودن مسیر پروژه به sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../')))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'taskvibe.settings')
django.setup()

from tasks.models import DailyPhoto
from django.db.models import Max

# پیدا کردن همه (user, date) های یکتا با جدیدترین رکورد
latest_photos = DailyPhoto.objects.values('user', 'date').annotate(latest_id=Max('id'))
latest_ids = set(item['latest_id'] for item in latest_photos)

# حذف رکوردهایی که id آنها در بین جدیدترین‌ها نیست
duplicates = DailyPhoto.objects.exclude(id__in=latest_ids)
count = duplicates.count()
duplicates.delete()
print(f"Deleted {count} duplicate DailyPhoto records.") 