from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from django.contrib.admin import AdminSite
from django.contrib.auth.models import User
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta
from .models import Task, DailyPhoto, Mood, Group, Challenge, Profile, Message

class TaskVibeAdminSite(AdminSite):
    site_header = "TaskVibe Administration"
    site_title = "TaskVibe Admin"
    index_title = "Welcome to TaskVibe Administration"
    
    def index(self, request, extra_context=None):
        # Get statistics for the dashboard
        extra_context = extra_context or {}
        
        # Task statistics
        total_tasks = Task.objects.count()
        completed_tasks = Task.objects.filter(completed=True).count()
        pending_tasks = Task.objects.filter(completed=False).count()
        overdue_tasks = Task.objects.filter(
            completed=False,
            due_date__lt=timezone.now()
        ).count()
        
        # User statistics
        total_users = User.objects.count()
        active_users = User.objects.filter(
            last_login__gte=timezone.now() - timedelta(days=30)
        ).count()
        
        # Recent activity
        recent_tasks = Task.objects.order_by('-created_at')[:5]
        recent_photos = DailyPhoto.objects.order_by('-uploaded_at')[:5]
        
        extra_context.update({
            'task_count': total_tasks,
            'completed_tasks': completed_tasks,
            'pending_tasks': pending_tasks,
            'overdue_tasks': overdue_tasks,
            'user_count': total_users,
            'active_users': active_users,
            'recent_tasks': recent_tasks,
            'recent_photos': recent_photos,
        })
        
        return super().index(request, extra_context)

# Create custom admin site instance
admin_site = TaskVibeAdminSite(name='taskvibe_admin')

class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'priority', 'energy_level', 'completed', 'due_date', 'created_at')
    list_filter = ('completed', 'priority', 'energy_level', 'recurring', 'created_at', 'due_date')
    search_fields = ('title', 'description', 'user__username', 'tags')
    list_editable = ('completed', 'priority', 'energy_level')
    readonly_fields = ('created_at',)
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'title', 'description', 'tags')
        }),
        ('Status & Priority', {
            'fields': ('completed', 'priority', 'energy_level', 'recurring')
        }),
        ('Timing', {
            'fields': ('due_date', 'created_at')
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')
    
    def colored_priority(self, obj):
        colors = {
            'LOW': 'green',
            'MEDIUM': 'orange', 
            'HIGH': 'red'
        }
        return format_html(
            '<span style="color: {};">{}</span>',
            colors.get(obj.priority, 'black'),
            obj.get_priority_display()
        )
    colored_priority.short_description = 'Priority'

class DailyPhotoAdmin(admin.ModelAdmin):
    list_display = ('user', 'date', 'photo_preview', 'mood', 'uploaded_at')
    list_filter = ('date', 'mood', 'uploaded_at')
    search_fields = ('user__username', 'mood')
    readonly_fields = ('uploaded_at', 'photo_preview')
    date_hierarchy = 'date'
    ordering = ('-date',)
    
    fieldsets = (
        ('Photo Information', {
            'fields': ('user', 'date', 'photo', 'photo_preview')
        }),
        ('Mood & Metadata', {
            'fields': ('mood', 'uploaded_at')
        }),
    )
    
    def photo_preview(self, obj):
        if obj.photo:
            return format_html(
                '<img src="{}" style="max-height: 50px; max-width: 50px; border-radius: 5px;" />',
                obj.photo.url
            )
        return "No photo"
    photo_preview.short_description = 'Preview'

class MoodAdmin(admin.ModelAdmin):
    list_display = ('user', 'mood', 'recorded_at')
    list_filter = ('mood', 'recorded_at')
    search_fields = ('user__username',)
    readonly_fields = ('recorded_at',)
    date_hierarchy = 'recorded_at'
    ordering = ('-recorded_at',)
    
    def colored_mood(self, obj):
        colors = {
            'HAPPY': 'green',
            'EXCITED': 'blue',
            'TIRED': 'orange',
            'ANXIOUS': 'red'
        }
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            colors.get(obj.mood, 'black'),
            obj.get_mood_display()
        )
    colored_mood.short_description = 'Mood'

class GroupAdmin(admin.ModelAdmin):
    list_display = ('name', 'member_count', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('name', 'members__username')
    readonly_fields = ('created_at',)
    filter_horizontal = ('members',)
    
    fieldsets = (
        ('Group Information', {
            'fields': ('name', 'members')
        }),
        ('Metadata', {
            'fields': ('created_at',)
        }),
    )
    
    def member_count(self, obj):
        return obj.members.count()
    member_count.short_description = 'Members'

class ChallengeAdmin(admin.ModelAdmin):
    list_display = ('title', 'group', 'target_tasks', 'deadline', 'created_at', 'is_active')
    list_filter = ('group', 'deadline', 'created_at')
    search_fields = ('title', 'description', 'group__name')
    readonly_fields = ('created_at',)
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Challenge Information', {
            'fields': ('group', 'title', 'description')
        }),
        ('Goals & Timeline', {
            'fields': ('target_tasks', 'deadline', 'created_at')
        }),
    )
    
    def is_active(self, obj):
        from django.utils import timezone
        return obj.deadline > timezone.now()
    is_active.boolean = True
    is_active.short_description = 'Active'

class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'avatar_preview')
    search_fields = ('user__username', 'user__email')
    
    def avatar_preview(self, obj):
        if obj.avatar:
            return format_html(
                '<img src="{}" style="max-height: 50px; max-width: 50px; border-radius: 50%;" />',
                obj.avatar.url
            )
        return "No avatar"
    avatar_preview.short_description = 'Avatar'

class MessageAdmin(admin.ModelAdmin):
    list_display = ('user', 'group', 'content_preview', 'timestamp')
    list_filter = ('group', 'timestamp')
    search_fields = ('content', 'user__username', 'group__name')
    readonly_fields = ('timestamp',)
    date_hierarchy = 'timestamp'
    ordering = ('-timestamp',)
    
    def content_preview(self, obj):
        return obj.content[:50] + "..." if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content'

# Custom admin actions
@admin.action(description="Mark selected tasks as completed")
def mark_tasks_completed(modeladmin, request, queryset):
    queryset.update(completed=True)
    modeladmin.message_user(request, f"{queryset.count()} tasks marked as completed.")

@admin.action(description="Mark selected tasks as incomplete")
def mark_tasks_incomplete(modeladmin, request, queryset):
    queryset.update(completed=False)
    modeladmin.message_user(request, f"{queryset.count()} tasks marked as incomplete.")

@admin.action(description="Set priority to High")
def set_priority_high(modeladmin, request, queryset):
    queryset.update(priority='HIGH')
    modeladmin.message_user(request, f"{queryset.count()} tasks set to High priority.")

@admin.action(description="Set priority to Medium")
def set_priority_medium(modeladmin, request, queryset):
    queryset.update(priority='MEDIUM')
    modeladmin.message_user(request, f"{queryset.count()} tasks set to Medium priority.")

@admin.action(description="Set priority to Low")
def set_priority_low(modeladmin, request, queryset):
    queryset.update(priority='LOW')
    modeladmin.message_user(request, f"{queryset.count()} tasks set to Low priority.")

# Add custom actions to TaskAdmin
TaskAdmin.actions = [
    mark_tasks_completed, 
    mark_tasks_incomplete,
    set_priority_high,
    set_priority_medium,
    set_priority_low
]

# Register models with custom admin site
admin_site.register(Task, TaskAdmin)
admin_site.register(DailyPhoto, DailyPhotoAdmin)
admin_site.register(Mood, MoodAdmin)
admin_site.register(Group, GroupAdmin)
admin_site.register(Challenge, ChallengeAdmin)
admin_site.register(Profile, ProfileAdmin)
admin_site.register(Message, MessageAdmin)