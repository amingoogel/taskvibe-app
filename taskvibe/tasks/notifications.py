from django.core.mail import send_mail
from django.conf import settings
from .models import Task, Challenge
from datetime import datetime, timedelta
from django.utils import timezone

def send_task_reminder(task):
    if task.due_date and not task.completed:
        time_diff = task.due_date - timezone.now()
        if time_diff <= timedelta(hours=1) and time_diff > timedelta(0):
            subject = f"Task Reminder: {task.title}"
            message = f"Hi {task.user.username},\n\nYour task '{task.title}' is due soon ({task.due_date}). Please complete it!\n\nTaskVibe"
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [task.user.email],
                fail_silently=False,
            )

def send_challenge_update(challenge, user):
    completed_tasks = Task.objects.filter(
        user=user,
        completed=True,
        created_at__gte=challenge.created_at,
        created_at__lte=challenge.deadline
    ).count()
    progress = (completed_tasks / challenge.target_tasks * 100) if challenge.target_tasks > 0 else 0
    subject = f"Challenge Update: {challenge.title}"
    message = f"Hi {user.username},\n\nYou've completed {completed_tasks} tasks in the challenge '{challenge.title}'. Progress: {progress:.2f}%.\n\nKeep it up!\nTaskVibe"
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
    )

def check_reminders():
    tasks = Task.objects.filter(completed=False, due_date__isnull=False)
    for task in tasks:
        send_task_reminder(task)