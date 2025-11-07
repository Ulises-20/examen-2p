#!/usr/bin/env python3
"""
scripts/sqlite_to_postgres.py

Simple migration helper: copy rows from a local SQLite DB (backend/examen.db)
into a Postgres destination using SQLAlchemy models from `backend/models.py`.

Usage:
  python scripts/sqlite_to_postgres.py --src backend/examen.db --dest "postgresql+psycopg2://user:pass@host:port/dbname"

Be sure to run this from the repo root and have your virtualenv active with:
  pip install -r backend/requirements.txt

This script will create tables on the destination if they don't exist and insert
all participants. It does NOT attempt to deduplicate or update existing rows.
Use with care.
"""
import argparse
import os
import sys

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

try:
    # import model definitions from the backend package
    from backend.models import Base, Participant
except Exception as e:
    print("Error importing backend.models. Run this script from the repo root and ensure PYTHONPATH includes the repo root.")
    raise


def connect(url, sqlite=False):
    if sqlite:
        return create_engine(url, connect_args={"check_same_thread": False})
    return create_engine(url, pool_pre_ping=True)


def main():
    parser = argparse.ArgumentParser(description='Copy participants from SQLite to Postgres')
    parser.add_argument('--src', default='backend/examen.db', help='Path to source SQLite DB file')
    parser.add_argument('--dest', required=True, help='Destination SQLAlchemy URL (e.g. postgresql+psycopg2://user:pass@host:port/dbname)')
    parser.add_argument('--preserve-ids', action='store_true', help='Attempt to preserve primary key ids when inserting')
    args = parser.parse_args()

    src_path = os.path.abspath(args.src)
    if not os.path.exists(src_path):
        print(f"Source DB not found: {src_path}")
        sys.exit(1)

    src_url = f"sqlite:///{src_path}"
    dest_url = args.dest

    print(f"Source: {src_url}")
    print(f"Destination: {dest_url}")

    src_engine = connect(src_url, sqlite=True)
    dest_engine = connect(dest_url, sqlite=False)

    # create tables on destination if needed
    Base.metadata.create_all(bind=dest_engine)

    SrcSession = sessionmaker(bind=src_engine)
    DestSession = sessionmaker(bind=dest_engine)

    src_s = SrcSession()
    dest_s = DestSession()

    try:
        total_src = src_s.query(Participant).count()
        total_dest = dest_s.query(Participant).count()
        print(f"Source rows: {total_src}, Destination existing rows: {total_dest}")

        if total_src == 0:
            print("No rows to copy. Exiting.")
            return

        confirm = input(f"Proceed to copy {total_src} rows into destination? This will append rows. (y/N): ")
        if confirm.lower() != 'y':
            print("Aborted by user.")
            return

        rows = src_s.query(Participant).all()
        copied = 0
        for r in rows:
            new = Participant(
                Nombre=r.Nombre,
                Apellidos=r.Apellidos,
                Email=r.Email,
                Twitter=r.Twitter,
                Ocupacion=r.Ocupacion,
                Avatar=r.Avatar,
                Acepto=r.Acepto,
            )
            if args.preserve_ids:
                try:
                    # attempt to set primary key before insert (may fail on some DBs)
                    new.Id = r.Id
                except Exception:
                    pass
            dest_s.add(new)
            copied += 1

        dest_s.commit()
        print(f"Copied {copied} rows successfully.")

    finally:
        src_s.close()
        dest_s.close()


if __name__ == '__main__':
    main()
