---
title: Sending and reading email
minutes: 8
---
Python's standard library can build, send and read email. That's useful for reports, alerts and simple automations.

## Building a message

```python
from email.message import EmailMessage

msg = EmailMessage()
msg["From"] = "reports@example.com"
msg["To"] = "jerry@example.com"
msg["Subject"] = "Daily sales report"
msg.set_content("Hi Jerry,\n\nRevenue today: ₹48,200.\n\n– your Python script")
msg.add_attachment(b"date,revenue\n2026-11-14,48200\n", maintype="text", subtype="csv", filename="sales.csv")
print(msg["Subject"], "|", [p.get_filename() for p in msg.iter_attachments()])
```

## Sending with SMTP

```py
import os
import smtplib

with smtplib.SMTP("smtp.gmail.com", 587) as server:
    server.starttls()                                   # encrypt the connection
    server.login(os.environ["SMTP_USER"], os.environ["SMTP_APP_PASSWORD"])
    server.send_message(msg)
```

- Gmail and most providers require an **app password** (with 2-factor auth on), not your normal password.
- Read credentials from environment variables. Never hard-code them or commit them to Git.
- For production apps, use a transactional email service's API (SES, SendGrid, Postmark); they handle deliverability.

## Reading with IMAP

```py
import email
import imaplib
import os

with imaplib.IMAP4_SSL("imap.gmail.com") as box:
    box.login(os.environ["SMTP_USER"], os.environ["SMTP_APP_PASSWORD"])
    box.select("INBOX")
    _, ids = box.search(None, '(FROM "alerts@bank.example" UNSEEN)')
    for num in ids[0].split()[-5:]:
        _, data = box.fetch(num, "(RFC822)")
        m = email.message_from_bytes(data[0][1])
        print(m["Date"], m["Subject"])
```

IMAP search criteria like `FROM`, `SUBJECT`, `SINCE 01-Nov-2026` and `UNSEEN` let you filter on the server.
