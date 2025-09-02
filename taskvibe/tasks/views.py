from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Task, DailyPhoto, Mood, Group, Challenge, Message
from .serializers import TaskSerializer, DailyPhotoSerializer, MoodSerializer, GroupSerializer, ChallengeSerializer, MessageSerializer
from .notifications import send_task_reminder, send_challenge_update
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from .serializers import UserProfileSerializer

User = get_user_model()

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        task = serializer.save(user=self.request.user)
        send_task_reminder(task)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        task = self.get_object()
        task.completed = True
        task.save()
        return Response({'status': 'task completed'})

class DailyPhotoViewSet(viewsets.ModelViewSet):
    queryset = DailyPhoto.objects.all()
    serializer_class = DailyPhotoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return DailyPhoto.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get', 'post', 'put'], url_path='by-date')
    def by_date(self, request):
        date = request.data.get('date') or request.query_params.get('date')
        if not date:
            return Response({'error': 'date is required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            photo_obj = DailyPhoto.objects.get(user=request.user, date=date)
        except DailyPhoto.DoesNotExist:
            photo_obj = None

        if request.method in ['POST', 'PUT']:
            data = request.data.copy()
            data['date'] = date
            if photo_obj:
                serializer = self.get_serializer(photo_obj, data=data, partial=True)
            else:
                serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            serializer.save(user=request.user)
            return Response(serializer.data)
        else:  # GET
            if photo_obj:
                serializer = self.get_serializer(photo_obj)
                return Response(serializer.data)
            else:
                return Response({'detail': 'No photo for this date.'}, status=status.HTTP_404_NOT_FOUND)

class MoodViewSet(viewsets.ModelViewSet):
    queryset = Mood.objects.all()
    serializer_class = MoodSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Mood.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Group.objects.filter(members=self.request.user)

    def perform_create(self, serializer):
        group = serializer.save()
        group.members.add(self.request.user)

    @action(detail=True, methods=['post'])
    def manage_members(self, request, pk=None):
        group = self.get_object()
        user_ids = request.data.get('user_ids', [])
        
        # اطمینان از اینکه کاربر درخواست‌دهنده مدیر گروه است (در اینجا ساده‌سازی شده)
        # if request.user != group.creator:
        #     return Response({'error': 'Only the group admin can manage members'}, status=status.HTTP_403_FORBIDDEN)

        try:
            users = User.objects.filter(id__in=user_ids)
            group.members.set(users)
            # همیشه کاربر فعلی را در گروه نگه دار
            group.members.add(request.user)
            return Response(GroupSerializer(group).data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ChallengeViewSet(viewsets.ModelViewSet):
    queryset = Challenge.objects.all()
    serializer_class = ChallengeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Challenge.objects.filter(group__members=self.request.user)

    def perform_create(self, serializer):
        challenge = serializer.save()
        for member in challenge.group.members.all():
            send_challenge_update(challenge, member)

    @action(detail=True, methods=['get'])
    def progress(self, request, pk=None):
        challenge = self.get_object()
        members = challenge.group.members.all()
        progress = []
        for member in members:
            completed_tasks = Task.objects.filter(
                user=member,
                completed=True,
                created_at__gte=challenge.created_at,
                created_at__lte=challenge.deadline
            ).count()
            progress.append({
                'username': member.username,
                'completed_tasks': completed_tasks,
                'target_tasks': challenge.target_tasks,
                'progress_percentage': (completed_tasks / challenge.target_tasks * 100) if challenge.target_tasks > 0 else 0
            })
        return Response(progress)

class UserSearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.query_params.get('q', '')
        if len(query) < 2:
            return Response([])
        users = User.objects.filter(username__icontains=query).exclude(id=request.user.id)
        serializer = UserProfileSerializer(users, many=True)
        return Response(serializer.data)


class GroupMessagesView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, group_id):
        messages = Message.objects.filter(group_id=group_id).order_by('-timestamp')[:50][::-1]
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)