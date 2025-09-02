from django.db.models import Count
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Task, Mood
from datetime import datetime, timedelta
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import LabelEncoder
import numpy as np
from rest_framework.permissions import IsAuthenticated

class TaskAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = datetime.now().date()
        tasks = Task.objects.filter(user=request.user, created_at__date=today)
        completed_tasks = tasks.filter(completed=True).count()
        total_tasks = tasks.count()
        completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0

        # تحلیل حال و هوا
        moods = Mood.objects.filter(user=request.user, recorded_at__date=today)
        mood_counts = moods.values('mood').annotate(count=Count('mood'))

        # پیشنهاد هوشمند با یادگیری ماشین
        suggestions = []
        past_tasks = Task.objects.filter(user=request.user, created_at__gte=today - timedelta(days=30))
        if past_tasks.exists() and len(past_tasks) >= 3:  # حداقل ۳ وظیفه برای خوشه‌بندی
            df = pd.DataFrame(list(past_tasks.values('title', 'energy_level', 'created_at')))
            
            # تبدیل داده‌های متنی به عددی
            le_title = LabelEncoder()
            le_energy = LabelEncoder()
            df['title_encoded'] = le_title.fit_transform(df['title'])
            df['energy_encoded'] = le_energy.fit_transform(df['energy_level'])
            
            # خوشه‌بندی با K-Means
            X = df[['title_encoded', 'energy_encoded']]
            kmeans = KMeans(n_clusters=3, random_state=42)
            df['cluster'] = kmeans.fit_predict(X)
            
            # پیشنهاد وظایف از خوشه‌های پرتکرار
            frequent_cluster = df['cluster'].value_counts().index[0]
            suggested_tasks = df[df['cluster'] == frequent_cluster][['title', 'energy_level']].head(3).to_dict('records')
            suggestions = [{"title": task['title'], "energy_level": task['energy_level']} for task in suggested_tasks]
        else:
            # پیشنهاد ساده در صورت کمبود داده
            frequent_tasks = pd.DataFrame(list(past_tasks.values('title', 'energy_level')))
            if not frequent_tasks.empty:
                suggestions = frequent_tasks['title'].value_counts().head(3).index.to_list()
                suggestions = [{"title": task, "energy_level": "MEDIUM"} for task in suggestions]

        return Response({
            "daily_report": {
                "completed_tasks": completed_tasks,
                "total_tasks": total_tasks,
                "completion_rate": completion_rate,
            },
            "mood_analysis": list(mood_counts),
            "suggestions": suggestions,
        })