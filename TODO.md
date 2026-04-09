# TODO

## Next Steps
- [x] Add basic rate limiting
- [x] Add caching headers
- [x] Add SEO titles + sitemap
- [x] Add git init and commit 
- [x] Where do change request go? find a solution for now

## Optimize/SEO
- [x] **Fix robots.txt:** Opret `public/robots.txt` for at forhindre, at Cloudflare's fallback SPA-HTML sniger sig ind i dokumentet.
- [x] **Dynamisk SEO Opsætning:** Installer og integrer `react-helmet-async` til state-management ift. head-tags.
- [x] **SEO Opret Komponent:** Byg en genanvendelig `<SEO />` komponent, der nemt styrer sidetitler, meta-beskrivelser, Open Graph (Facebook, m.m.) og Twitter Cards pr. page.
- [x] **Implementer Dynamisk SEO:** Udskift standard `document.title` med `<SEO />` komponenten på `HomePage`, `ClubListPage`, `ClubDetailPage` med lokations-specifik data.
- [x] **Basis Tags i index.html:** Udfyld `index.html` med statiske fallback Open Graph/Twitter tags, og et relevant preview billede til forsiden.
- [x] **Struktureret Data (JSON-LD):** Tilføj "Schema markup" på `ClubDetailPage` (fx som `SportsActivityLocation`), for at forbedre klubbernes rige søgeresultater på Google med adressedata mv.

## API
- [x] **Cloudflare KV Opsætning:** Opret et `API_KEYS` KV Namespace i Cloudflare Dashboard til validering af unikke tokens.
- [x] **Middleware/Validering:** Implementer tjek af `Authorization` header i Cloudflare Functions for at tillade/afvise adgang baseret på KV data.
- [x] **Test af Tokens:** Verificer at API'et afviser forespørgsler uden gyldig token og accepterer dem med en gyldig token fra KV.
- [x] **Skjult API Side:** Opret en `/api-docs` (eller lignende skjult sti) page, der forklarer hvordan man bruger og får sit token.
- [x] **API Dokumentation:** Beskriv endpoints, JSON-formater og fejlkoder på den skjulte side (f.eks. ved hjælp af et simpelt Swagger-lignende interface).


## Security Hardening (Minor / Nit)
> Disse fixes er identificeret i code review men vurderet ikke-blokerende for PR. Tag dem i næste iteration.

### Minor
- [x] **OPTIONS CORS bør være origin-specifik** (`_middleware.ts` linje ~19): Preflight returnerer `Access-Control-Allow-Origin: *`. Bør validere origin på samme måde som `jsonResponse`, så wildcard ikke gives til ukendte origins.
- [x] **Fjern interne fejlbeskeder i produktion** (alle endpoints): `catch (e) { return errorResponse("Database error: " + e.message) }` lækker intern schema-info til klienten i produktion. Bør returnere generisk besked i prod og kun vise details i dev (check `env.ENVIRONMENT`).
- [x] **Input-størrelsesvalidering på POST /api/requests** (`requests.ts`): `user_message` og `user_contact` har ingen maksimal længde. Tilføj fx `MAX_MESSAGE_LENGTH = 5000` og `MAX_CONTACT_LENGTH = 500` for at forebygge store payloads i databasen.

### Nit
- [x] **Skriv typer på database-resultater i `full_scorecard.ts`** (linje ~70): `holes.forEach((h: any) => ...)` og `allLengths.forEach((l: any) => ...)` bør have eksplicitte interfaces i stedet for `any`, så TypeScript fanger schema-ændringer.
- [x] **Reducér logging i produktion** (`klub/[id].ts` linje ~51): `console.error(...)` i catch-blokken logger altid — overvej at begrænse til `env.ENVIRONMENT !== "production"` eller log kun en generisk besked.

## Future / Post-Launch
- [ ] Implement Admin Interface (for reviewing change requests)
- [x] Add google ads (AdSense) (when site is live)
- [x] Add cookie compliance (when site is live)
- [x] Caching, so we do not need to call api all the time
- [ ] Can we make a puplic api for the data? and can we sell it to other sites?
