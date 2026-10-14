# ExetatGPA

ExetatGPA calculates the position of an EXETAT score within its examination session and maps that position to other EXETAT sessions and eight external reference distributions. EXETAT is the secondary school leaving examination in the Democratic Republic of the Congo. The official percentage and examination year are preserved alongside the calculated results.

[Open the calculator](https://contributions-ledger.org/tools/exetatgpa/) · [Read the method and sources](https://contributions-ledger.org/tools/exetatgpa/methods.html)

## What the results mean

Positions are calculated separately for the 2008–2023 sessions from recovered published scores of successful candidates. The proportion of these scores at or above the selected score is reported, including all ties. A result of “top 2.59%” therefore means that 2.59% of the recovered published successful scores in that session were at least as high as the selected score.

For example, 59% in EXETAT 2021 falls within the top 28.70% of that session's recovered published successful scores. The corresponding position in the 2022 distribution is reached at 61.38%. This correspondence describes relative standing within the two published score distributions; it does not establish equal knowledge or skills or predict an individual's result in another examination.

Participants without a published exact score are considered separately. Within the recovered groups for which participant counts are available, lower and upper limits are calculated by placing all unpublished scores below or at or above the selected score. These limits describe uncertainty due to missing scores within those groups. They are neither confidence intervals nor national ranks, and they do not account for groups absent from the recovered data.

## External references

The same relative position is located separately in each of the following distributions. Each output retains the reference's population, scale, and published resolution.

| Reference | Population and output |
| --- | --- |
| United States, 2016 pre-March SAT report | Reported high school grade point average (GPA) categories among GPA respondents: A+, A, A-minus, B, C, or D/E/F |
| France, 2025 general baccalaureate | Candidates of all registration statuses; final average on the 0–20 scale |
| Japan, 2024 Common Test | Mathematics I/A main-session examinees; integer subject marks on the 0–100 scale |
| South Korea, 2024 College Scholastic Ability Test (CSAT) | Mathematics examinees; standard score and grade band |
| England, summer 2024 A-levels | Entries across all subjects; A*–U categories |
| Germany, 2024 Abitur | National final-grade frequencies; lower grades indicate stronger outcomes |
| Türkiye, 2024 Basic Proficiency Test (TYT) | Candidates with published scores of at least 100; score bands |
| South Africa, 2024 National Senior Certificate (NSC) | Mathematics performance bands |

These outputs express correspondence in distributional position. The populations and examinations differ, so the results do not establish equivalent educational attainment, curricula, or credentials. No numerical US GPA or combined international grade is calculated. For the US reference, the possible effect of missing GPA-category responses is shown separately and together with the EXETAT missing-score limits.

Source links and the calculation rules for each reference are provided on the [method and sources page](https://contributions-ledger.org/tools/exetatgpa/methods.html).

## Using the calculator

Select an examination year and an observed integer score. The calculator accepts 648 observed year–score combinations from 2008 through 2023. Scores below 50, decimal scores, and scores absent from the selected session's recovered distribution are unavailable. A cross-session result is withheld when the requested position lies beyond the target session's observed range.

The interface, results, and interpretation are available in 19 languages: English, French, Japanese, Korean, Chinese (Simplified), German, Turkish, Lingala, Swahili, Spanish, Portuguese, Hindi, Arabic, Bengali, Russian, Urdu, Indonesian, Zulu, and Afrikaans. English is the default; a link ending in `?lang=fr`, for example, opens the French interface. Arabic and Urdu use right-to-left layouts.

Detailed methods, original reference descriptions, and scale labels remain in English or the reference's original notation. Translations have not received independent native-speaker proofreading. Changing the interface language leaves the calculations and available references unchanged.

Scores are processed in the browser and are not saved, included in the URL, or transmitted to the host. No account is required. The host receives ordinary page requests.

## Running locally

Node.js 20 or later is required. There are no npm dependencies to install.

```sh
git clone https://github.com/eliakim-k/ExetatGPA.git
cd ExetatGPA
npm test
npm run build
npm run preview
```

Open [http://127.0.0.1:8790/](http://127.0.0.1:8790/). The static website is generated in `dist/`.

## Data and reproducibility

The repository contains aggregate EXETAT score counts and the external reference distributions. No names or individual examination records are included. File hashes and source identities are recorded in [data/PROVENANCE.json](data/PROVENANCE.json).

[src/engine.mjs](src/engine.mjs) calculates positions and reference outputs from [data/app-data.json](data/app-data.json). Cross-session matching uses linear interpolation between supported scores. External mappings use frequency-based interpolation or discrete categories and score bands, according to the reference. US category boundaries are evaluated with exact integer comparisons.

[tests/retained-results.json](tests/retained-results.json) contains expected outputs for numerical verification. The tests cover 676 threshold profiles, including 28 unobserved thresholds excluded from calculator input, 3,380 US category comparisons, 14,196 numerical comparisons for the other references, and 10,368 cross-session checks. Boundary handling, ties, unavailable inputs, and worked examples are also tested. The recorded numerical checks are summarized in [VALIDATION.json](VALIDATION.json).

© 2026 Eliakim M. Kambale. Third-party reference data remain subject to their respective terms of use.

## Score sheet (1.2.0)

The interface uses a dark blue score sheet with editable scores, two worked examples, a cohort-position marker and eight separate reference records. The Language label sits above a keyboard-accessible flag menu. A DRC flag map appears beside the introduction; image sources and licenses are available through Image credits. Country flags serve as navigation cues for languages and do not select numerical reference scales. Unsupported scores clear the previous result immediately. The calculation engine, numerical inputs and interpretation limits remain unchanged.
