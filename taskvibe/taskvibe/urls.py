from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from tasks.admin import admin_site
import os

urlpatterns = [
    path('admin/', admin_site.urls),
    path('api/', include('tasks.urls')),
    path('', TemplateView.as_view(template_name='index.html'), name='home'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)