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


## Future / Post-Launch
- [ ] Implement Admin Interface (for reviewing change requests)
- [ ] Add google ads (AdSense) (when site is live)
- [ ] Add cookie compliance (when site is live)
- [ ] Caching, so we do not need to call api all the time
- [ ] Can we make a puplic api for the data? and can we sell it to other sites?
