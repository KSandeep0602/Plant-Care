# WhatsApp Reminder Integration with Python/Selenium

This replaces Twilio with a **Python WhatsApp Web sender** that works directly in your existing Node.js app.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│          Your Plant Care App (Node.js)                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  API: GET /api/send-whatsapp                               │
│  Cron: app/lib/cron.ts (every minute)                      │
│                                                              │
│         ↓                                                    │
│  app/lib/pythonReminderSender.ts                           │
│  (spawns Python subprocess)                                │
│                                                              │
│         ↓                                                    │
│  scripts/reminder_sender_web.py                            │
│  (fetches MongoDB reminders)                               │
│                                                              │
│         ↓                                                    │
│  scripts/whatsapp_web_sender.py                            │
│  (uses Selenium to send via WhatsApp Web)                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Setup (One-time)

### 1. Install Python Dependencies

```bash
cd scripts
pip install -r requirements_web.txt
```

### 2. First-Time Login (QR Code Scan)

```bash
python whatsapp_web_sender.py
```

- Chrome opens WhatsApp Web
- Scan QR code with your WhatsApp phone
- Session is saved to `~/.whatsapp_web_session`
- Future runs won't need login

### 3. Verify Setup

Test reminders:
```bash
python reminder_sender_web.py
```

You should see:
```
✅ Connected to MongoDB
🔔 Processing X reminders...
📤 Sending reminder for [plant name]
✅ Message sent to [phone]
✅ Done! Sent: X reminders
```

## How It Works

**Same as before, but with Python instead of Twilio:**

1. **Node.js API** → GET `/api/send-whatsapp`
   - Returns: `{ success, sentCount, message }`

2. **Node.js Cron** → Runs every minute
   - Spawns Python subprocess
   - Waits for completion

3. **Python Script** → Fetches MongoDB reminders
   - Checks if due
   - Checks if already sent today
   - Sends via WhatsApp Web (browser automation)
   - Updates MongoDB

## Usage

### Manual Trigger (One-off)
```bash
curl http://localhost:3000/api/send-whatsapp
```

Response:
```json
{
  "success": true,
  "sentCount": 3,
  "message": "Python reminder sender completed: 3 reminders sent",
  "provider": "python-selenium-web"
}
```

### Automated (Built-in)
- Cron runs automatically every minute in development
- Production: Use external scheduler or keep this cron running

### With Debug Info
```bash
curl "http://localhost:3000/api/send-whatsapp?debug=1"
```

## Advantages Over Twilio

✅ **No API costs** - Direct browser automation
✅ **No rate limiting** - Send as many as you want
✅ **No sandbox** - Works with real contacts immediately
✅ **No API maintenance** - Self-hosted solution
✅ **Same interface** - Existing code works unchanged

## Configuration

### .env.local (No changes needed)
```
MONGODB_URI=mongodb+srv://...
MONGODB_DB_NAME=plantcare
```

### Optional
```
# Customize WhatsApp session location (default: ~/.whatsapp_web_session)
WHATSAPP_SESSION_PATH=/custom/path
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `ModuleNotFoundError: No module named 'pymongo'` | `pip install -r requirements_web.txt` |
| `ChromeDriver not found` | Update Chrome or Selenium handles it automatically |
| `QR code error` | Run `python whatsapp_web_sender.py` manually first |
| `Message not sent` | Check if phone number is in WhatsApp contacts |
| `Timeout in /api/send-whatsapp` | Python process taking >5 mins, increase timeout in `pythonReminderSender.ts` |
| `No reminders found` | Create test reminders or check MongoDB connection |

## Files Modified

- ✅ `app/lib/pythonReminderSender.ts` — New Node.js → Python bridge
- ✅ `app/lib/cron.ts` — Now uses Python sender
- ✅ `app/api/send-whatsapp/route.ts` — Now uses Python sender
- ✅ Removed Twilio dependency from Node.js (still in package.json for compatibility)

## Performance

- **First message**: ~3-5 seconds (browser startup)
- **Subsequent messages**: ~2-3 seconds each (browser already open)
- **Batch of 10 reminders**: ~30-40 seconds total

For faster delivery, run the Python script in the background:
```bash
nohup python scripts/reminder_sender_web.py >> logs/reminder.log 2>&1 &
```

Or use a dedicated cron (Linux/Mac):
```bash
*/1 * * * * cd /path/to/project && python scripts/reminder_sender_web.py >> logs/reminder.log 2>&1
```

## Next Steps

1. ✅ Install deps: `pip install -r scripts/requirements_web.txt`
2. ✅ Test login: `python scripts/whatsapp_web_sender.py`
3. ✅ Scan QR code with phone
4. ✅ Test reminders: `python scripts/reminder_sender_web.py`
5. ✅ Done! Cron and API now use Python WhatsApp sender

No more Twilio needed! 🎉
