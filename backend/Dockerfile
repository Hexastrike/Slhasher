# Pull base image
FROM    python:3.11.10-bookworm

# Set environment variables
# Prevent writing pyc files to disk
# Prevent buffering stdout and stderr
ENV     PYTHONDONTWRITEBYTECODE 1
ENV     PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /usr/src/slhasher/backend
COPY    . . 

# Install dependencies
RUN     pip install --upgrade pip
RUN     pip install -r requirements.txt

# Run migrations and start the Django development server
CMD     ["bash", "-c", "python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]