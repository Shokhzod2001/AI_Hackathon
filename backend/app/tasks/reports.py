from app.tasks import celery_app


@celery_app.task(name="daily_report")
def generate_daily_report():
    return {"status": "ok"}


@celery_app.task(name="send_daily_digest")
def send_daily_digest():
    return {"status": "ok"}
