# PixMMO Roadmap

The PixMMO release timeline for Q4 2026, as a static site for GitHub Pages. It's styled after [utherstudios.com](https://utherstudios.com).

| Target | Release |
| --- | --- |
| End of October | Daily Login Rewards + Quests |
| Mid November | World Boss |
| End of November / early December | Mobile release |
| December 1 | Christmas Event |

## Pages

- `index.html`: the timeline, Daily Login Rewards (with a clickable 28-day calendar demo), Quests and the monthly gem budget
- `christmas.html`: the Christmas Event page, with a countdown to December 1 and snowfall

## Deploy

1. Merge to `main`.
2. In the repo, go to **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
3. `.github/workflows/pages.yml` publishes the site on every push to `main`.

To preview locally, run `python3 -m http.server` and open http://localhost:8000.

Milestone dates are set in the `data-date` attributes in `index.html`. Statuses ("Up next", "Planned", "Live") and countdowns update automatically from those dates.
