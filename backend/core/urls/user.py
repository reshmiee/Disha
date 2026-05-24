"""
core/urls/user.py — User profile URL patterns
Mounted at: /api/user/
"""

from django.urls import path
from core.views_user import (
    me_view,
    update_profile_view,
    upgrade_plan_view,
    plans_view,
    submit_feedback_view,
)

urlpatterns = [
    path("me/",        me_view,              name="user-me"),
    path("me/update/", update_profile_view,  name="user-update"),
    path("plans/",     plans_view,           name="subscription-plans"),
    path("upgrade/",   upgrade_plan_view,    name="upgrade-plan"),
    path("feedback/",  submit_feedback_view, name="submit-feedback"),
]
