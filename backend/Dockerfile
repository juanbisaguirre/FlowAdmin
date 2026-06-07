FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update \
    && apt-get install -y gcc libpq-dev \
    && apt-get clean

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY ./app ./app

# Expose port
EXPOSE 8000

# Command to run the application
CMD ["fastapi", "dev", "app/main.py", "--port", "8000", "--host", "0.0.0.0"]
