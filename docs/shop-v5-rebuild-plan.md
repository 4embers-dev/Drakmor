# Drakmor 5.0 — veikala nomaiņa (izolēta migrācija)

## Lēmums
Jaunā veikala sistēma aizstās veco veikala UI un tā klienta loģiku, nevis darbosies paralēli. Publiskā `main` netiek mainīta, līdz pārbaude ir pabeigta. Vizuālais paraugs: lietotāja iesūtītais Drakmor 5.0 mantu veikala attēls (kalējs Eldriks, deviņas kategorijas, 3 kolonnas, zelta panelis, septiņas apakšējās funkcijas).

## Pārbaudīts esošajā kodā
- `city.html` pašlaik vienlaikus satur vairākas veikala implementācijas: `renderModernShop`, `renderIllustratedShop`, `v2Render`, `v2Details`; tās nedrīkst atstāt aktīvas līdzās jaunajai.
- `assets/shop-5-illustrated.css` ir iepriekšējās versijas stili, kurus jaunais veikals nedrīkst mantot.
- `v2Catalog` ģenerē 9 kategorijas × 50 ierakstus, taču tikai pirmie 20 ieroči ir atzīmēti `purchasable`. Pārējie 430 ir klienta pusē ģenerēti demonstrācijas ieraksti, nevis apstiprināts servera katalogs.
- Esošie Supabase RPC: `drakmor_shop_state`, `drakmor_buy_weapon`, `drakmor_equip_weapon`. Tās ir reālo spēlētāja datu integrācijas; pirms jebkādas dzēšanas jāpārbauda to atkarības.
- Veikala konts un zelta bilance ir jāņem no servera, nevis no attēlā norādītajiem parauga skaitļiem.

## Izpildes secība
1. Inventarizēt visas `city.html` veikala ieejas un datubāzes izsaukumus; saglabāt spēles profilu, kontu un inventāra līgumus.
2. Izveidot izolētu `assets/shop-v5.js` un `assets/shop-v5.css` ar vienu veikala ieejas punktu. Vecā veikala funkcijas vairs netiek izsauktas.
3. Definēt servera katalogu, inventāra transakcijas un autorizācijas/RLS politikas. Neļaut klientam noteikt cenu, zeltu vai priekšmeta īpašumtiesības.
4. Realizēt filtrus, kategorijas, detaļas, iegādi, ekipēšanu un pārdošanu; darbībām, kam vēl nav servera atbalsta, jābūt skaidri neaktīvām.
5. Pievienot individuālu grafiku pēc atsūtītā parauga, pielāgot mobilo skatu un tastatūras pieejamību.
6. Pārbaudīt darījumus: nepietiekams zelts, neatbilstošs līmenis, dubultklikšķis, paralēli pirkumi, atjaunošana, neautorizēta piekļuve.
7. Izņemt veco veikala UI/CSS/JS no `city.html` un tikai tad sagatavot pārskatāmu PR apvienošanai ar `main`.

## Datu saglabāšanas noteikums
Nedzēst spēlētāju kontus, inventāra ierakstus vai Supabase funkcijas tikai tāpēc, ka to nosaukumā ir `shop`. Vispirms pārbaudīt, vai funkcija tiek izmantota citur, un vajadzības gadījumā migrēt datus bez zudumiem.
