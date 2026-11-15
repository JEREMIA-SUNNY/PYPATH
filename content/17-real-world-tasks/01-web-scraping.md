---
title: Web scraping with requests and BeautifulSoup
minutes: 10
---
Scraping means downloading a web page and extracting data from its HTML. You need two packages:

```bash
pip install requests beautifulsoup4
```

## Fetching a page

```py
import requests

resp = requests.get("https://quotes.toscrape.com/", timeout=10)
resp.raise_for_status()          # raise an error for 4xx/5xx responses
html = resp.text
print(resp.status_code, len(html))
```

`quotes.toscrape.com` and `books.toscrape.com` are sandboxes built for practising scraping.

## Parsing HTML

BeautifulSoup turns HTML into a tree you can search. CSS selectors are usually the easiest way to find elements:

```py
from bs4 import BeautifulSoup

soup = BeautifulSoup(html, "html.parser")
print(soup.title.get_text())
for q in soup.select("div.quote")[:3]:
    text = q.select_one("span.text").get_text(strip=True)
    author = q.select_one("small.author").get_text()
    tags = [t.get_text() for t in q.select("a.tag")]
    print(f"{author}: {text[:50]}… {tags}")
```

| Method | Returns |
| --- | --- |
| `soup.select("css")` | list of all matching elements |
| `soup.select_one("css")` | first match or `None` |
| `el.get_text(strip=True)` | the element's text |
| `el["href"]` / `el.get("href")` | an attribute |

Open the page in your browser and use **Inspect** to find the right selectors.

## Following pagination

```py
import time
from urllib.parse import urljoin

url = "https://quotes.toscrape.com/"
while url:
    soup = BeautifulSoup(requests.get(url, timeout=10).text, "html.parser")
    # ... extract data ...
    nxt = soup.select_one("li.next a")
    url = urljoin(url, nxt["href"]) if nxt else None
    time.sleep(1)                 # be polite
```

## Scraping responsibly

- Check the site's `robots.txt` and terms of service. Prefer an official API when there is one.
- Rate-limit your requests (`time.sleep`), and set a descriptive `User-Agent`.
- Don't scrape personal data or anything behind a login you aren't entitled to.
- Websites change their HTML; write code that fails clearly when a selector finds nothing.

## No third-party packages? html.parser

The standard library has a basic HTML parser too, which is handy when you can't install anything. You'll use it in this module's exercise.
