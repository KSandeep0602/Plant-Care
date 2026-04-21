#!/usr/bin/env python3
"""
Plant Care Reminder Sender using WhatsApp Web (Selenium)
No APIs, no Twilio - sends directly via WhatsApp Web
"""

import os
import sys
import time
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict
from dotenv import load_dotenv

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

try:
    from pymongo import MongoClient
    from whatsapp_web_sender import WhatsAppWebSender
except ImportError as e:
    print(f"Error: Missing required package: {e}")
    print("Install with: python -m pip install pymongo selenium python-dotenv")
    sys.exit(1)

load_dotenv('.env.local')

MONGODB_URI = os.getenv('MONGODB_URI')
REMINDER_CHANNEL = os.getenv('REMINDER_CHANNEL', 'whatsapp').lower()

class ReminderSenderWeb:
    def __init__(self):
        """Initialize MongoDB connection."""
        if not MONGODB_URI:
            raise ValueError("MONGODB_URI not set in .env.local")
        
        try:
            self.client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
            self.client.admin.command('ping')
            db_name = os.getenv('MONGODB_DB_NAME', 'test')
            self.db = self.client[db_name]
            self.reminders_collection = self.db['reminders']
            self.users_collection = self.db['users']
            print("✅ Connected to MongoDB")
        except Exception as e:
            print(f"❌ MongoDB connection failed: {e}")
            raise
        
        self.sent_count = 0

    def has_reminder_been_sent_today(self, last_sent_date: Optional[str]) -> bool:
        """Check if reminder was already sent today."""
        if not last_sent_date:
            return False
        
        try:
            last_sent = datetime.fromisoformat(last_sent_date.replace('Z', '+00:00'))
            if last_sent.tzinfo is None:
                last_sent = last_sent.replace(tzinfo=timezone.utc)

            today = datetime.now(timezone.utc)
            return (
                today.year == last_sent.year and
                today.month == last_sent.month and
                today.day == last_sent.day
            )
        except:
            return False

    def calculate_next_watering(self, frequency_per_week: int) -> datetime:
        """Calculate next watering date based on frequency."""
        if frequency_per_week <= 0:
            frequency_per_week = 1
        days_between = 7 / frequency_per_week
        return datetime.now(timezone.utc) + timedelta(days=days_between)

    def process_reminders(self, headless=True):
        """Fetch and send all due reminders via WhatsApp Web."""
        try:
            reminders = list(self.reminders_collection.find({'completed': False}))
            now = datetime.now(timezone.utc)

            if not reminders:
                print("ℹ️  No active reminders found")
                return

            print(f"🔔 Processing {len(reminders)} reminders...")

            due_reminders = []

            for reminder in reminders:
                next_watering_date = reminder.get('nextWateringDate')
                if not next_watering_date:
                    continue

                # Parse ISO date string
                if isinstance(next_watering_date, str):
                    next_watering_dt = datetime.fromisoformat(next_watering_date.replace('Z', '+00:00'))
                else:
                    next_watering_dt = next_watering_date

                if next_watering_dt.tzinfo is None:
                    next_watering_dt = next_watering_dt.replace(tzinfo=timezone.utc)

                # Check if due
                if now < next_watering_dt:
                    continue

                # Check if already sent today
                last_sent_date = reminder.get('lastReminderSentDate')
                if self.has_reminder_been_sent_today(
                    last_sent_date.isoformat() if last_sent_date else None
                ):
                    print(f"⏰ Skipping {reminder.get('plantName')} - already sent today")
                    continue

                plant_name = reminder.get('plantName', 'plant')
                phone = reminder.get('phone')

                if not phone:
                    print(f"⚠️  Skipping {plant_name} - no phone number")
                    continue

                due_reminders.append(reminder)

            if not due_reminders:
                print("ℹ️  No due reminders right now")
                return

            wa_sender = None
            try:
                wa_sender = WhatsAppWebSender(headless=headless)

                if not wa_sender.wait_for_whatsapp_load():
                    print("❌ WhatsApp Web did not load")
                    return

                if not wa_sender.check_login_status():
                    if not wa_sender.wait_for_login():
                        print("❌ WhatsApp login failed")
                        return

                for reminder in due_reminders:
                    plant_name = reminder.get('plantName', 'plant')
                    phone = reminder.get('phone')

                    print(f"📤 Sending reminder for {plant_name}")

                    # Send via WhatsApp Web
                    message = f"🌱 Plant Reminder\n\nTime to water {plant_name} today. 💧"

                    try:
                        if wa_sender.send_message(str(phone), message):
                            # Update reminder
                            next_date = self.calculate_next_watering(
                                reminder.get('frequencyPerWeek', 1)
                            )

                            self.reminders_collection.update_one(
                                {'_id': reminder['_id']},
                                {
                                    '$set': {
                                        'nextWateringDate': next_date,
                                        'whatsappSent': True,
                                        'lastReminderSentDate': datetime.now(timezone.utc),
                                    }
                                }
                            )
                            self.sent_count += 1
                            print(f"✅ Reminder updated in database")
                        else:
                            print(f"❌ Failed to send reminder for {plant_name}")

                    except Exception as e:
                        print(f"❌ Error sending reminder: {e}")
            finally:
                if wa_sender:
                    wa_sender.close()

        except Exception as e:
            print(f"❌ Error processing reminders: {e}")
            raise

    def run(self, headless=True):
        """Run the reminder sender."""
        try:
            print(f"\n⏰ Starting WhatsApp Web reminder sender at {datetime.now(timezone.utc).isoformat()}")
            print(f"📝 Channel: WhatsApp Web (Selenium)\n")
            
            self.process_reminders(headless=headless)
            
            print(f"\n✅ Done! Sent: {self.sent_count} reminders")
        except Exception as e:
            print(f"❌ Fatal error: {e}")
            sys.exit(1)
        finally:
            self.client.close()


if __name__ == '__main__':
    # Run with browser visible (set headless=True for servers)
    sender = ReminderSenderWeb()
    sender.run(headless=False)
