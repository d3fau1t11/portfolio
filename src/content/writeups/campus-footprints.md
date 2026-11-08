## Files provided
- `incident-note.txt`
- `campus-archive.json`
- `bundle.zip` (contains the same two files, no hidden extras)

## Step 1 — Read the incident note
```bash
cat incident-note.txt
```
Output:
```
FICTIONAL CAMPUS. Use only the attached archive; do not investigate real people.
Select the latest revision for: Textiles at 09:00, Astronomy at 11:00, Music at 14:00.
Concatenate their seal values in that order, with no separators, inside tibeb{...}.
```

So we need:
1. Textiles at 09:00 → latest revision seal
2. Astronomy at 11:00 → latest revision seal
3. Music at 14:00 → latest revision seal

Then concatenate the three seals in that order, no separators, and wrap in `tibeb{...}`.

## Step 2 — Inspect the JSON archive
```bash
python3 -m json.tool campus-archive.json
```
Relevant parts:
- `departments` maps department names to rooms:
  - Textiles → Loom Hall
  - Astronomy → Sky Room
  - Music → Echo Court
- `timetable` is a list of entries with `revision`, `room`, `time`, and `seal`.

## Step 3 — Find the latest revision for each target
We must filter by **room** and **time**, then pick the highest `revision`.

| Department | Room       | Time  | Matching entries                                                                 | Latest revision | Seal               |
|------------|------------|-------|----------------------------------------------------------------------------------|-----------------|--------------------|
| Textiles   | Loom Hall  | 09:00 | rev1 `old_weave`, rev2 `campus_footp`                                            | rev2            | `campus_footp`     |
| Astronomy  | Sky Room   | 11:00 | rev1 `old_sky`, rev2 `rints_705262`                                              | rev2            | `rints_705262`     |
| Music      | Echo Court | 14:00 | rev1 `old_echo`, rev2 `93eea545fbeb69`                                           | rev2            | `93eea545fbeb69`   |

**Tricky/interesting bits:**
- There is a decoy entry: `revision 2, room Sky Room, time 09:00, seal wrong_slot`. It has revision 2, but the time is wrong for Astronomy (Astronomy is at 11:00). You must filter by both room **and** time.
- The seal values are intentionally split: `campus_footp` + `rints_705262` together form `campus_footprints_705262`. The word “footprints” spans the first two seals. This is a deliberate design — don’t insert any separators or try to “fix” the fragments.

## Step 4 — Concatenate in the required order
Order: Textiles → Astronomy → Music

```
campus_footp + rints_705262 + 93eea545fbeb69
= campus_footprints_70526293eea545fbeb69
```

## Step 5 — Wrap the flag
```
tibeb{campus_footprints_70526293eea545fbeb69}
```

## Verification
`unzip -l bundle.zip` shows only the two files already seen, so there is no hidden steganography or extra file. The challenge is purely about correctly interpreting the incident note and filtering the JSON.
