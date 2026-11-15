---
title: Dates and times
minutes: 8
---
The `datetime` module handles dates, times, durations and formatting.

```python
from datetime import date, datetime, timedelta

today = date(2026, 11, 14)
print(today, today.year, today.strftime("%d %b %Y"), today.weekday())

launch = datetime(2026, 12, 1, 9, 30)
print(launch.isoformat())
```

## Arithmetic with timedelta

Subtracting dates gives a `timedelta`; adding a `timedelta` moves a date:

```python
from datetime import date, timedelta

start = date(2026, 11, 14)
deadline = date(2026, 12, 25)
print((deadline - start).days, "days to go")
print(start + timedelta(weeks=2))
```

## Parsing and formatting

`strftime` formats a date as text ("string format time"); `strptime` parses text into a datetime ("string parse time"):

```python
from datetime import datetime

dt = datetime.strptime("14/11/2026 19:43", "%d/%m/%Y %H:%M")
print(dt.strftime("%A, %d %B %Y at %I:%M %p"))
print(datetime.fromisoformat("2026-11-14T19:43:00"))
```

| Code | Meaning | Example |
| --- | --- | --- |
| `%Y` / `%m` / `%d` | year / month / day | `2026` / `11` / `14` |
| `%H` / `%M` | hour (24h) / minute | `19` / `43` |
| `%b` / `%B` | month name short / long | `Nov` / `November` |
| `%a` / `%A` | weekday short / long | `Sat` / `Saturday` |

## Time zones

A datetime without a zone is "naive". For anything that crosses zones (servers, users in different countries) use aware datetimes with `zoneinfo`:

```python
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

utc_now = datetime(2026, 11, 14, 14, 13, tzinfo=timezone.utc)
print(utc_now.astimezone(ZoneInfo("Asia/Kolkata")))
```

> [!TIP]
> Store timestamps in UTC; convert to the user's zone only for display.
