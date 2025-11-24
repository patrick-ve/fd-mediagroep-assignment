# Test Data

This directory contains sample Excel files for testing the Chart Agent MVP.

## Test Files

### 1. ov-checkins.xlsx
OV check-ins per day data (in millions):
- Maandag: 4.1
- Dinsdag: 4.2
- Woensdag: 4.4
- Donderdag: 4.7
- Vrijdag: 4.2
- Zaterdag: 2.3
- Zondag: 1.7

### 2. studieschuld.xlsx
Student debt data (in billions):
- 2020: 25
- 2021: 26
- 2022: 26.5
- 2023: 27.3
- 2024: 27.9
- 2025: 29

## Test Prompts

### Test Prompt 1 (Text Input)
```
Geef me een grafiek met het aantal checkins per dag bij het OV:
Maandag = 4,1
Dinsdag = 4,2
Woensdag = 4,4
Donderdag = 4,7
Vrijdag = 4,2
Zaterdag = 2,3
Zondag = 1,7
De getallen zijn in miljoenen check-ins.
```

### Test Prompt 2 (Text Input)
```
Ik wil een grafiek die aangeeft hoeveel miljard studieschuld studenten hebben in de laatste jaren. De waarden zijn: 2020 = 25, 2021 = 26, 2022 = 26.5, 2023 = 27.3, 2024 = 27.9, en 2025 = 29.
```

### Test Prompt 3 (Excel File)
```
test-data/ov-checkins.xlsx
```

### Test Prompt 4 (Excel File)
```
test-data/studieschuld.xlsx
```

## Creating Excel Files

To create the test Excel files, you can use any spreadsheet software (Excel, Google Sheets, LibreOffice Calc) with the following structure:

**Format:**
- Column A: Labels
- Column B: Values
- First row can be headers (optional)

**Example:**
```
Day         | Check-ins
Maandag     | 4.1
Dinsdag     | 4.2
...
```
