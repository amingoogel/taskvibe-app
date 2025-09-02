from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, DailyPhotoViewSet, MoodViewSet, GroupViewSet, ChallengeViewSet, GroupMessagesView, UserSearchView
from .analytics import  TaskAnalyticsView
from .auth_views import RegisterView, LoginView, ProfileView, PasswordChangeView, ValidateRegistrationDataView, VerifyEmailView

router = DefaultRouter()
router.register(r'tasks', TaskViewSet)
router.register(r'photos', DailyPhotoViewSet)
router.register(r'moods', MoodViewSet)
router.register(r'groups', GroupViewSet)
router.register(r'challenges', ChallengeViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('validate-registration/', ValidateRegistrationDataView.as_view(), name='validate-registration'),
    path('verify-email/', VerifyEmailView.as_view(), name='verify-email'),
    path('analytics/', TaskAnalyticsView.as_view(), name='analytics'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('groups/<int:group_id>/messages/', GroupMessagesView.as_view(), name='group-messages'),
    path('users/search/', UserSearchView.as_view(), name='user-search'),
    path('password_change/', PasswordChangeView.as_view(), name='password-change'),
]