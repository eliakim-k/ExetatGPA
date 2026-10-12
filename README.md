# ExetatGPA

An EXETAT result is retained with its official percentage and examination session. Standing within the recovered published successful cohort is calculated, matched to another EXETAT session where supported, and expressed separately through eight named external reference distributions.

The running app is published at https://contributions-ledger.org/tools/exetatgpa/ . Its source repository is https://github.com/eliakim-k/ExetatGPA . These locations are release targets until the retained release record confirms verification.

## Run

Node.js 20 or later is sufficient. There are no npm dependencies.

```text
npm test
npm run build
npm run preview
```

Open http://127.0.0.1:8790/ . Only `dist/` is deployed. Input selection is browser-local; no account, telemetry or score submission is used. The bilingual calculator has English and French labels; reference population/source descriptions remain in their documented English form. The methods page is in English.

## Calculation and evidence

`src/engine.mjs` computes inclusive upper-tail positions from `data/annual_successful_score_histogram.csv` as encoded in `data/app-data.json`. Exact US category boundaries use integer cross-products. The other seven inverses preserve the retained interpolation or step rules, direction and display resolution. Cross-session interpolation is withheld outside target support. The browser accepts 648 actually observed integer session–score pairs. An additional 28 unobserved threshold values in the retained 676-pair reference outputs are withheld.

`data/PROVENANCE.json` identifies project-relative source paths, hashes, official external URLs and approvals used during extraction. Retained aggregate inputs include no names or individual records. `scripts/export_inputs.py` documents extraction from the governed paper project and requires its prospective not-used option-identity receipt. It is an extraction/audit utility, not required to run this standalone repository. Updating scientific inputs requires renewed source verification; the app must not silently retrieve revised online distributions.

`tests/retained-results.json` preserves numerical verification fixtures derived from governed outputs. Tests check all 676 retained threshold profiles, 3,380 US category assignments, 14,196 non-US numerical cells, all retained cross-session conversions and availability decisions, exact category boundaries, inclusive ties, unsupported inputs and the two approved worked examples. The calculation engine uses input distributions, not these expected outputs. `VALIDATION.json` records the completed numerical checks.

## Interpretation

The eight external references are US 2016 pre-March SAT reported GPA categories; France 2025 general baccalaureate; Japan 2024 Common Test Mathematics I/A; South Korea 2024 CSAT Mathematics; England summer 2024 all-subject A-level entries; Germany 2024 national Abitur; Türkiye 2024 TYT published scores of at least 100; and South Africa 2024 NSC Mathematics bands. They are separate populations and scales.

The published-success position and represented-participant missing-score bounds are shown separately. US target-category nonresponses are separately bounded and also combined with source bounds. These are not confidence intervals or national ranks. Correspondence in cohort standing does not establish equal educational attainment, equivalent knowledge, grades, curricula or credentials, and does not estimate the same person's score in another examination. No numerical US GPA is produced.

## Publication scope

Public assets are explicitly allowlisted by `build.mjs`. Manuscripts, Supplementary Information, person-level data, credentials, private research folders, CMS data and authentication configuration are excluded. The app publication is separate from paper approval and release. Original scientific units remain unchanged.

© 2026 Eliakim M. Kambale. No new license grant is asserted for third-party reference data; source identities are retained. Hosting and source publication are authorized. The website's visitor password and owner editor are managed separately from this public app.

## Languages (1.1.0)

The calculator interface and result interpretation support English, French, Japanese, Korean, German, Turkish, Simplified Chinese, Spanish, Hindi, Arabic, Portuguese, Bengali, Russian, Urdu, Indonesian, Swahili, Lingala, Zulu and Afrikaans. A native-name language menu is provided. Arabic and Urdu use right-to-left layouts; numerical outputs are isolated to preserve their ordering. A language can be linked with `?lang=ar`, for example. Language is the only URL parameter written by the app; scores are not saved or transmitted.

Language coverage was selected by the author for reference-population, international and Congolese audiences. It is not a complete global speaker ranking. The 47-key catalogs translate controls, results, uncertainty explanations and interpretation limits. Original scientific reference descriptions, named scale labels and the detailed methods page remain in English, disclosed beside the introduction and in source-detail headings. Grade/category labels are kept in the reference scale's notation. Language selection does not add a numerical reference for the language's country or change any calculations.

Translations were drafted and self-reviewed. They have not received independent native-speaker proofreading. Catalog tests verify completeness and preserved interpolation fields; they do not certify linguistic quality. All 19 languages were checked at 320-pixel mobile width, with eight unchanged reference results and no horizontal overflow. The retained numerical test suite remains applicable.

The language menu starts with English (the default), French, Japanese, Korean, Chinese, German, Turkish, Lingala, Swahili, Spanish and Portuguese. The remaining entries are Hindi, Arabic, Bengali, Russian, Urdu, Indonesian, Zulu and Afrikaans. An explicit `?lang=` URL retains the selected language; the plain calculator URL opens in English.
