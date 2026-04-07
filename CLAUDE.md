# WhereToWatch

Polska aplikacja mobilna (PWA) do wyszukiwania filmów, seriali i wydarzeń sportowych z informacją gdzie je obejrzeć w Polsce.

## Stack

- **React 19** (Create React App)
- **Jedna strona** — cały UI w `src/App.js`, bez routera, bez zewnętrznych bibliotek UI
- **Docelowe API:** TMDB (The Movie Database) — jeszcze niepodpięte
- **Stan:** React `useState`, brak Redux/Zustand

## Struktura aplikacji

Aplikacja działa jako single-file SPA z nawigacją przez stan `currentScreen`:

| Ekran | Opis |
|-------|------|
| `home` | Strona główna: popularne filmy (karuzela), IMDb Top 8, nadchodzące wydarzenia sportowe |
| `search` | Wyszukiwarka po tytule i gatunku, lista wyników z ocenami |
| `detail` | Szczegóły tytułu: opis, reżyser, obsada, platformy streamingowe z cenami |
| `sports` | Lista wydarzeń sportowych z datami i platformami transmisji |
| `saved` | Zapisana lista tytułów użytkownika (stan tylko w pamięci — brak persystencji) |

## Dane testowe (obecna wersja demo)

Wszystkie dane są hardcodowane w `src/App.js`:

- `MOVIES` — 6 tytułów (filmy + seriale) z platformami streamingowymi i cenami PLN
- `SPORTS` — 4 wydarzenia (Liga Mistrzów, Roland Garros, GP Monako, Ekstraklasa)
- `RANKINGS` — Top 8 IMDb (statyczna lista)

## Platformy streamingowe w danych testowych

Netflix (33 zł/msc), Canal+ (45 zł/msc), Apple TV+ (34.99 zł/msc), Disney+ (37.99 zł/msc), Max (29.99 zł/msc), SkyShowtime (19.99 zł/msc), Amazon Prime (49 zł/rok), Viaplay (34 zł/msc), Eurosport (29.99 zł/msc), TVP Sport (za darmo).

## Motyw kolorystyczny

Zdefiniowany w obiekcie `t` w `src/App.js`:

```js
bg: "#0B0F1A"   // tło główne (ciemny granat)
s:  "#141929"   // tło kart
a:  "#00E5A0"   // akcent (zielony neonowy)
w:  "#FFB547"   // oceny IMDb (złoty)
d:  "#FF4D6A"   // oceny RT (czerwony)
tx: "#E8ECF4"   // tekst główny
tm: "#6B7394"   // tekst pomocniczy
```

## Następny krok: TMDB API

Podpięcie TMDB API zastąpi dane z `MOVIES` i `RANKINGS`. Co trzeba zrobić:

1. Zarejestrować się na [themoviedb.org](https://www.themoviedb.org/) i uzyskać klucz API
2. Dodać klucz do `.env` jako `REACT_APP_TMDB_KEY`
3. Endpointy do wykorzystania:
   - `GET /movie/popular` — popularne filmy (zastąpi karuzelę na home)
   - `GET /movie/top_rated` — top rated (zastąpi RANKINGS)
   - `GET /search/movie?query=...` — wyszukiwarka
   - `GET /movie/{id}/watch/providers` — platformy streamingowe (filtrować po `PL`)
4. Obrazy posterów: `https://image.tmdb.org/t/p/w200{poster_path}`
5. TMDB nie zawiera ocen Rotten Tomatoes — RT trzeba albo pominąć, albo podpiąć osobne API (OMDb)

## Komendy

```bash
npm start    # uruchom dev server (localhost:3000)
npm build    # build produkcyjny
npm test     # testy
```
