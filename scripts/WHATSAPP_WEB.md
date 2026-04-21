# WhatsApp Web Reminder Sender (Python + Selenium)

Send plant care reminders via **WhatsApp Web** - No APIs, no Twilio, no external services needed.

## How It Works

Uses browser automation (Selenium) to:
1. Open WhatsApp Web in Chrome
2. Log in once (QR code scan)
3. Find contacts by phone/name
4. Send messages automatically
5. Store session for future runs (no re-login needed)

## Requirements

- Python 3.8+
- Chrome or Chromium browser
- ChromeDriver (auto-installed with Selenium 4.6+)

## Installation

1. **Install dependencies:**
```bash
cd scripts
pip install -r requirements_web.txt
```

2. **Download ChromeDriver:**
   - Automatic: Selenium 4.6+ handles it automatically
   - Manual: https://chromedriver.chromium.org/ (match your Chrome version)

## Quick Test

```bash
python whatsapp_web_sender.py
```

Expected:
- Chrome opens WhatsApp Web
- First time: Scan QR code with phone
- Message sent to +919876543210
- ✅ Success!

## Run Reminders (Production)

```bash
python reminder_sender_web.py
```

Or automated (every minute):

### Linux/Mac:
```bash
crontab -e
# Add:
*/1 * * * * cd /path/to/project/scripts && python reminder_sender_web.py >> reminder_web.log 2>&1
```

### Windows (Task Scheduler):
1. Open Task Scheduler
2. Create Basic Task → "Plant Care Reminders Web"
3. Trigger: Every 1 minute
4. Action: Run program
   - Program: `C:\Python311\python.exe`
   - Arguments: `reminder_sender_web.py`
   - Start in: `C:\path\to\project\scripts`

## Configuration

In `.env.local`:
```
MONGODB_URI=mongodb+srv://...
MONGODB_DB_NAME=plantcare
REMINDER_CHANNEL=whatsapp
```

## How It Sends Messages

1. Opens WhatsApp Web browser
2. Auto-logs in (session persisted in `~/.whatsapp_web_session`)
3. For each due reminder:
   - Searches for contact by phone number
   - Types message: "🌱 Plant Reminder: Time to water [plant name] 💧"
   - Clicks Send
4. Updates MongoDB with sent status

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `ChromeDriver error` | Update Chrome or install ChromeDriver matching your version |
| `QR code not loading` | Make sure you're running headless=False first time |
| `Contact not found` | Verify phone number is saved in WhatsApp contacts |
| `Message not sent` | Check browser console for errors, try manual send first |
| `Timeout errors` | Increase timeouts in script if internet is slow |

## Advantages

✅ No API costs (Twilio alternative)
✅ No rate limiting
✅ Sends directly from your WhatsApp account
✅ Works with any WhatsApp contact
✅ No bot/sandboxing restrictions
✅ Logs persist automatically

## Disadvantages

⚠️ Requires browser (headless mode available but slower)
⚠️ WhatsApp may show "Tap to confirm this is a chat bot" on first message
⚠️ Slower than API (browser automation ~2-3s per message)
⚠️ Can't run on servers without display (unless using xvfb or headless with screenshots)

## Advanced Usage

### Headless (No Browser Window)
```python
from whatsapp_web_sender import send_whatsapp_message

# Run without showing browser
send_whatsapp_message("+919876543210", "Hi!", headless=True)
```

### Custom Session Path
Edit line in `whatsapp_web_sender.py`:
```python
user_data_dir = Path('/custom/path/.whatsapp_session')
```

### Send Multiple Messages
```python
from whatsapp_web_sender import WhatsAppWebSender

sender = WhatsAppWebSender(headless=False)
sender.wait_for_whatsapp_load()
sender.wait_for_login()

# Send to multiple contacts
sender.send_message("+919876543210", "Message 1")
sender.send_message("Mom", "Message 2")
sender.send_message("Group Name", "Message 3")

sender.close()
```

## Logs

Check what's happening:
```bash
python reminder_sender_web.py 2>&1 | tee reminder_web.log
```

Monitor live:
```bash
tail -f reminder_web.log
```
