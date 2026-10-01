# Gig driver mileage app sentiment: direct Reddit access (BLOCKED, no content retrieved)

## Could Reddit be read directly from this session?

### Takeaway
No. Every Reddit endpoint I tried (2026-10-01) was blocked, so I got no threads, quotes, permalinks, dates or upvote counts. These notes have no Reddit-sourced findings, and none should be attributed to them.

### Cited Findings
- `old.reddit.com` answered HTTP 200, but the body was always Reddit's ~323 KB "Welcome to Reddit" JavaScript interstitial, not the requested page. The page's embedded message reads: "Your request has been blocked by network security. Please try to login with your Reddit account." Tested with a Chrome User-Agent and with a custom bot User-Agent, with and without Accept and Accept-Language headers, a cookie jar and an `over18` cookie. Variants: subreddit listing, `/search`, `/search.json`, `/top/.json`, `/.rss`, and a thread `/comments/<id>/` page. Source: direct curl fetches (no URL to cite, since no content was served).
- `www.reddit.com`, `reddit.com`, `new.reddit.com`, `api.reddit.com`, `oauth.reddit.com` and `i.reddit.com` were all refused by the session's outbound proxy ("CONNECT tunnel failed, response 403"). Only `old.reddit.com` gets through the proxy, and Reddit itself blocks it.

### Inferences
- Reddit's bot protection blocks this cloud egress IP whatever headers are sent. Getting through would need an authenticated Reddit API (OAuth app credentials, with `oauth.reddit.com` allowed in the network policy) or a user-side browser session.

### Gaps
- All of the original objectives are unanswered from direct Reddit reads:
  - which mileage apps drivers recommend or warn against (Stride, Gridwise, Everlance, MileIQ, Driversnote, TripLog, Hurdlr, QuickBooks, Solo, Para) and why
  - pain points: missed trips, battery, accuracy, manual start/stop, multi-apping, paywalls, privacy, Android vs iPhone, exports
  - dead miles, and platform-reported miles vs app miles
  - feature wishes
  - quotes from US, UK, Canada and Australia subreddits
- No quotes were invented or reconstructed from memory.
