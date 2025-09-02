from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import UserProfileSerializer, ProfileSerializer
from .models import EmailVerification
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
import re

class ValidateRegistrationDataView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email')
        
        errors = {}
        
        # Check if all fields are provided
        if not username:
            errors['username'] = 'نام کاربری الزامی است'
        if not password:
            errors['password'] = 'رمز عبور الزامی است'
        if not email:
            errors['email'] = 'ایمیل الزامی است'
        
        if errors:
            return Response({"errors": errors}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check username format
        if len(username) < 3:
            errors['username'] = 'نام کاربری باید حداقل ۳ کاراکتر باشد'
        elif not re.match(r'^[a-zA-Z0-9_]+$', username):
            errors['username'] = 'نام کاربری فقط می‌تواند شامل حروف، اعداد و _ باشد'
        
        # Check password strength
        if len(password) < 8:
            errors['password'] = 'رمز عبور باید حداقل ۸ کاراکتر باشد'
        elif not re.search(r'[A-Z]', password):
            errors['password'] = 'رمز عبور باید شامل حداقل یک حرف بزرگ باشد'
        elif not re.search(r'[a-z]', password):
            errors['password'] = 'رمز عبور باید شامل حداقل یک حرف کوچک باشد'
        elif not re.search(r'\d', password):
            errors['password'] = 'رمز عبور باید شامل حداقل یک عدد باشد'
        elif not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            errors['password'] = 'رمز عبور باید شامل حداقل یک کاراکتر خاص (!@#$%^&*) باشد'
        
        # Check email format
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, email):
            errors['email'] = 'فرمت ایمیل صحیح نیست'
        
        # Check if username already exists
        if User.objects.filter(username=username).exists():
            errors['username'] = 'نام کاربری قبلاً استفاده شده است'
        
        # Check if email already exists
        if User.objects.filter(email=email).exists():
            errors['email'] = 'این ایمیل قبلاً ثبت شده است'
        
        if errors:
            return Response({"errors": errors}, status=status.HTTP_400_BAD_REQUEST)
        
        # All validations passed, send verification email
        # Delete any existing verification tokens for this email
        EmailVerification.objects.filter(email=email).delete()
        
        # Create new verification token
        verification = EmailVerification.objects.create(email=email)
        token = verification.generate_token()
        
        # Create verification URL
        verification_url = f"http://localhost:3000/verify-email?token={token}&email={email}"
        
        # Send email
        try:
            subject = 'تایید ایمیل TaskVibe'
            html_message = render_to_string('email/verification_email.html', {
                'verification_url': verification_url,
                'email': email
            })
            plain_message = strip_tags(html_message)
            
            send_mail(
                subject=subject,
                message=plain_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                html_message=html_message,
                fail_silently=False,
            )
            
            return Response({
                "message": "لینک تایید به ایمیل شما ارسال شد",
                "email": email,
                "username": username
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            verification.delete()
            return Response({
                "error": "خطا در ارسال ایمیل. لطفاً دوباره تلاش کنید"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class VerifyEmailView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        token = request.GET.get('token')
        email = request.GET.get('email')
        
        if not token or not email:
            return Response({
                "error": "توکن و ایمیل الزامی است"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            verification = EmailVerification.objects.get(email=email, token=token)
            
            if verification.is_expired():
                verification.delete()
                return Response({
                    "error": "لینک تایید منقضی شده است. لطفاً لینک جدید درخواست کنید"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            verification.is_verified = True
            verification.save()
            
            return Response({
                "message": "ایمیل با موفقیت تایید شد",
                "email": email
            }, status=status.HTTP_200_OK)
            
        except EmailVerification.DoesNotExist:
            return Response({
                "error": "لینک تایید نامعتبر است"
            }, status=status.HTTP_400_BAD_REQUEST)

class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email')
        
        if not all([username, password, email]):
            return Response({
                "error": "تمام فیلدها الزامی است"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if email is verified
        try:
            verification = EmailVerification.objects.get(
                email=email, 
                is_verified=True
            )
        except EmailVerification.DoesNotExist:
            return Response({
                "error": "لطفاً ابتدا ایمیل خود را تایید کنید"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create user
        try:
            user = User.objects.create_user(
                username=username, 
                password=password, 
                email=email
            )
            
            # Delete verification record
            verification.delete()
            
            # Generate tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user_id': user.id,
                'message': 'ثبت نام با موفقیت انجام شد'
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                "error": "خطا در ایجاد حساب کاربری"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user_id': user.id
            })
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

# --- API جدید پروفایل ---

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)
    def put(self, request):
        user_serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        profile_serializer = ProfileSerializer(request.user.profile, data=request.data, partial=True)
        user_valid = user_serializer.is_valid()
        profile_valid = profile_serializer.is_valid()
        if user_valid and profile_valid:
            user_serializer.save()
            profile_serializer.save()
            # Return updated user profile with avatar
            return Response(UserProfileSerializer(request.user).data)
        errors = {}
        errors.update(user_serializer.errors)
        errors.update(profile_serializer.errors)
        return Response(errors, status=status.HTTP_400_BAD_REQUEST)

class PasswordChangeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        if not user.check_password(old_password):
            return Response({"error": "رمز عبور فعلی صحیح نیست."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({"message": "رمز عبور با موفقیت تغییر کرد."}, status=status.HTTP_200_OK)