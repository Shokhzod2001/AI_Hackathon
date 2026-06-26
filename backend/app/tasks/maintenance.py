from app.tasks import celery_app


@celery_app.task(name="cleanup_logs")
def cleanup_old_logs():
    return {"status": "ok"}


@celery_app.task(name="refresh_keyword_cache")
def refresh_keyword_cache():
    return {"status": "ok"}
