#!/usr/bin/env python3
"""
WhatsApp Web Message Sender using Selenium
Sends messages via WhatsApp Web without any third-party APIs.
Requirements: Chrome/Firefox browser + Selenium
"""

import os
import time
import sys
from urllib.parse import quote
from pathlib import Path
from datetime import datetime
from typing import Optional
from dotenv import load_dotenv

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

try:
    from selenium import webdriver
    from selenium.webdriver.common.by import By
    from selenium.webdriver.common.keys import Keys
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.webdriver.chrome.options import Options as ChromeOptions
except ImportError:
    print("Error: Selenium not installed. Install with: pip install selenium")
    exit(1)

load_dotenv('.env.local')

class WhatsAppWebSender:
    def __init__(self, headless=False):
        """
        Initialize WhatsApp Web driver.
        headless=True: Run without browser window (for servers)
        headless=False: Show browser (for manual testing)
        """
        self.driver = None
        self.headless = headless
        self.initialized = False
        self.setup_driver()

    def setup_driver(self):
        """Initialize Chrome WebDriver."""
        script_dir = Path(__file__).resolve().parent
        session_dir = Path(
            os.getenv(
                "WHATSAPP_SESSION_PATH",
                str(script_dir / ".whatsapp_web_session"),
            )
        )
        session_dir.mkdir(parents=True, exist_ok=True)

        # Remove stale Chromium lock files left by crashed runs.
        for lock_name in ["SingletonLock", "SingletonCookie", "SingletonSocket"]:
            lock_path = session_dir / lock_name
            if lock_path.exists():
                try:
                    lock_path.unlink()
                except OSError:
                    pass

        def build_options(profile_dir: Path):
            chrome_options = ChromeOptions()
            chrome_options.add_argument(f'--user-data-dir={str(profile_dir)}')
            chrome_options.add_argument('--disable-blink-features=AutomationControlled')
            chrome_options.add_argument('--no-first-run')
            chrome_options.add_argument('--no-default-browser-check')
            chrome_options.add_argument('--disable-notifications')
            chrome_options.add_argument('--remote-debugging-port=0')
            chrome_options.add_argument('--log-level=3')
            chrome_options.add_experimental_option('excludeSwitches', ['enable-automation', 'enable-logging'])
            chrome_options.add_experimental_option('useAutomationExtension', False)

            if self.headless:
                chrome_options.add_argument('--headless=new')
                chrome_options.add_argument('--no-sandbox')
                chrome_options.add_argument('--disable-dev-shm-usage')

            return chrome_options

        try:
            self.driver = webdriver.Chrome(options=build_options(session_dir))
            self.driver.set_page_load_timeout(30)
            print("✅ Chrome WebDriver initialized")
            return
        except Exception as e:
            print(f"❌ Failed to initialize WebDriver with persistent profile: {e}")
            print("   Close all Chrome windows, then run again so the profile can be reused.")
            print("   Make sure ChromeDriver is installed: https://chromedriver.chromium.org/")
            raise

    def wait_for_whatsapp_load(self, timeout=60):
        """Wait for WhatsApp Web to load."""
        try:
            print("📱 Opening WhatsApp Web...")
            self.driver.get('https://web.whatsapp.com/')
            
            # Wait for either chat list or QR code
            WebDriverWait(self.driver, timeout).until(
                EC.presence_of_all_elements_located((By.XPATH, "//div[@data-testid='chat-list'] | //canvas[@aria-label='Scan this QR code to link a device!']"))
            )
            
            print("✅ WhatsApp Web loaded")
        except Exception as e:
            print(f"❌ Failed to load WhatsApp Web: {e}")
            return False
        
        return True

    def check_login_status(self):
        """Check if already logged in."""
        try:
            # If we can find chat list, we're logged in
            self.driver.find_element(By.XPATH, "//div[@data-testid='chat-list']")
            print("✅ Already logged into WhatsApp Web")
            self.initialized = True
            return True
        except:
            print("❌ Not logged in. Scan QR code with your phone...")
            return False

    def wait_for_login(self, timeout=120):
        """Wait for user to scan QR code and login."""
        print(f"\n⏳ Waiting for WhatsApp login (max {timeout}s)...")
        print("   Scan the QR code on the screen with your WhatsApp phone app")
        
        start_time = time.time()
        while time.time() - start_time < timeout:
            if self.check_login_status():
                time.sleep(3)  # Wait for page to fully load
                self.initialized = True
                return True
            time.sleep(2)
        
        print(f"❌ Login timeout after {timeout}s")
        return False

    def find_contact(self, phone_or_name: str, timeout=10) -> bool:
        """Find contact by phone number or name."""
        try:
            # Click search box
            search_box = WebDriverWait(self.driver, timeout).until(
                EC.element_to_be_clickable((By.XPATH, "//input[@title='Search or start new chat']"))
            )
            search_box.clear()
            search_box.send_keys(phone_or_name)
            
            print(f"🔍 Searching for: {phone_or_name}")
            time.sleep(2)
            
            # Click first result
            first_result = WebDriverWait(self.driver, timeout).until(
                EC.element_to_be_clickable((By.XPATH, "//div[@data-testid='chat-list-item']"))
            )
            first_result.click()
            
            print(f"✅ Contact found: {phone_or_name}")
            time.sleep(1)
            return True
        except Exception as e:
            print(f"❌ Contact not found: {e}")
            return False

    def _normalize_phone(self, phone: str) -> str:
        value = str(phone or "").strip().replace("whatsapp:", "")
        return "".join(ch for ch in value if ch.isdigit())

    def _looks_like_phone(self, value: str) -> bool:
        normalized = self._normalize_phone(value)
        return len(normalized) >= 8

    def open_phone_chat(self, phone: str, message: str, timeout=20) -> bool:
        try:
            normalized = self._normalize_phone(phone)
            if not normalized:
                print(f"❌ Invalid phone number: {phone}")
                return False

            url = f"https://web.whatsapp.com/send?phone={normalized}&text={quote(message)}"
            self.driver.get(url)

            WebDriverWait(self.driver, timeout).until(
                EC.any_of(
                    EC.presence_of_element_located((By.XPATH, "//footer//div[@contenteditable='true']")),
                    EC.presence_of_element_located((By.XPATH, "//button[@aria-label='Send']")),
                )
            )

            print(f"✅ Opened direct chat for {phone}")
            return True
        except Exception as e:
            print(f"❌ Direct chat open failed: {e}")
            return False

    def send_message(self, phone_or_name: str, message: str, timeout=10) -> bool:
        """Send message to a contact."""
        try:
            if not self.initialized:
                print("❌ WhatsApp not initialized. Login first.")
                return False

            # Use direct phone chat for reminder numbers; fallback to search for names.
            if self._looks_like_phone(phone_or_name):
                if not self.open_phone_chat(phone_or_name, message, timeout=20):
                    time.sleep(2)
                    self.driver.get('https://web.whatsapp.com/')
                    if not self.open_phone_chat(phone_or_name, message, timeout=20):
                        return False

                # WhatsApp pre-fills the message in the composer for direct chat URLs.
                # Use Enter rather than clicking the send button to avoid stale elements.
                try:
                    composer = WebDriverWait(self.driver, timeout).until(
                        EC.presence_of_element_located((By.XPATH, "//footer//div[@contenteditable='true']"))
                    )
                    composer.click()
                    composer.send_keys(Keys.ENTER)
                except Exception:
                    # Fallback to the page body if composer focus changes.
                    self.driver.find_element(By.TAG_NAME, "body").send_keys(Keys.ENTER)
            else:
                if not self.find_contact(phone_or_name, timeout):
                    return False

                msg_box = WebDriverWait(self.driver, timeout).until(
                    EC.element_to_be_clickable((By.XPATH, "//footer//div[@contenteditable='true']"))
                )
                msg_box.click()
                msg_box.send_keys(message)
                print(f"📝 Message typed: {message[:50]}...")
                time.sleep(1)

                # Send message using the button for name-based chats.
                send_button = WebDriverWait(self.driver, timeout).until(
                    EC.element_to_be_clickable((By.XPATH, "//button[@aria-label='Send'] | //span[@data-icon='send']/ancestor::button"))
                )
                send_button.click()
            
            print(f"✅ Message sent to {phone_or_name}")
            time.sleep(2)
            return True
        except Exception as e:
            print(f"❌ Failed to send message: {e}")
            return False

    def close(self):
        """Close WebDriver."""
        if self.driver:
            self.driver.quit()
            print("🚪 WebDriver closed")


def send_whatsapp_message(phone: str, message: str, headless=False) -> bool:
    """
    Simple function to send WhatsApp message.
    
    Args:
        phone: Phone number or contact name
        message: Message text to send
        headless: Run without showing browser
    
    Returns:
        True if successful, False otherwise
    """
    sender = None
    try:
        sender = WhatsAppWebSender(headless=headless)
        
        if not sender.wait_for_whatsapp_load():
            return False
        
        if not sender.check_login_status():
            if not sender.wait_for_login():
                return False
        
        return sender.send_message(phone, message)
    
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    
    finally:
        if sender:
            sender.close()


if __name__ == '__main__':
    # Test: Send message to a contact
    print("""
    ╔═══════════════════════════════════════════════╗
    ║    WhatsApp Web Message Sender (Selenium)    ║
    ╚═══════════════════════════════════════════════╝
    """)
    
    # Example: Send message
    result = send_whatsapp_message(
        phone="+919876543210",  # Phone number or contact name
        message="🌱 Plant Reminder: Time to water your Rose plant! 💧",
        headless=False  # Set to True for server/automation
    )
    
    if result:
        print("\n✅ Message sent successfully!")
    else:
        print("\n❌ Failed to send message")
