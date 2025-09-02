import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.urls import path
from tasks.consumers import ChallengeConsumer, GroupChatConsumer

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'taskvibe.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter([
            path("ws/challenge/<int:group_id>/", ChallengeConsumer.as_asgi()),
            path("ws/chat/<int:group_id>/", GroupChatConsumer.as_asgi()),
        ])
    ),
})