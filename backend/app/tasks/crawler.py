from app.tasks import celery_app


@celery_app.task(name="scan_telegram")
def scan_telegram_channels():
    return {"status": "ok", "scanned": 0}


@celery_app.task(name="scan_instagram")
def scan_instagram_hashtags():
    return {"status": "ok", "scanned": 0}


@celery_app.task(name="scan_olx")
def scan_olx_listings():
    return {"status": "ok", "scanned": 0}
