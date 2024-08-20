FROM python:3.11
COPY . /app
WORKDIR /app
RUN pip install -e .
CMD ["fastapi", "run", "worker_daemon_backend/server.py"]