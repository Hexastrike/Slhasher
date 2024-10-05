import os
import sys
import django

# Django Configuration Setup
# Add the backend directory (where manage.py is located) to the Python path
# This allows Python to recognize the Django project and the apps within it.
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set the default settings module for Django
# This environment variable tells Django which settings file to use.
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

# Initialize the Django environment
# This function sets up Django, loading the settings and making the project's
# models, apps, and other Django features available for use in the script.
django.setup()