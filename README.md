# LawBot Backend

## Database Migrations

This project now uses Alembic for schema migrations. Typical workflow:

```bash
alembic revision --autogenerate -m "describe change"
alembic upgrade head
```

The Alembic configuration lives in `alembic/`. It pulls database settings from `app.db.database`.

> **Note:** `create_tables.py` is still available for the original bootstrap, but future schema changes should go through Alembic migrations.

## Demo Data

To seed some sample lawyers, bookings, and reviews for testing the `/lawyers` filters:

```bash
python seed_demo_data.py
```

After running the seed script, try these queries in `/docs`:

- `GET /lawyers`
- `GET /lawyers?city=Mumbai`
- `GET /lawyers?specialization=divorce`
- `GET /lawyers?min_experience=5`
- `GET /lawyers?max_hourly_rate=2000`
- `GET /lawyers?min_rating=4.0`

The seed script is idempotent: rerunning it will update existing sample records without duplicating data.
