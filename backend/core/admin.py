from django.contrib import admin
from .models import UserProfile, RouteRating, Feedback

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ["user", "plan", "tokens_used", "tokens_reset_date", "subscription_expiry"]
    list_filter = ["plan"]
    search_fields = ["user__username", "user__email"]

@admin.register(RouteRating)
class RouteRatingAdmin(admin.ModelAdmin):
    list_display = ["city", "area", "rating", "time_of_day", "created_at"]
    list_filter = ["city", "rating"]

@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ["subject", "category", "user", "contact_email", "created_at"]
    list_filter = ["category", "created_at"]
    search_fields = ["subject", "message", "user__username", "contact_email"]
    readonly_fields = ["created_at"]
