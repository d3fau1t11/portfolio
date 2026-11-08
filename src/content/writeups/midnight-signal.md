## 1. Reconnaissance

We start with two files:

```bash
file bundle.zip signal.wav
unzip -l bundle.zip
ffprobe -hide_banner signal.wav
```

Output showed:

- `bundle.zip` contains only `signal.wav` (same file).
- `signal.wav` is a **RIFF WAVE, PCM 16-bit, mono, 8000 Hz**, duration ~12.68 s.

This is a classic audio stego / signal decoding challenge. The description says:

> *A short wave recording repeats no words. Decode the timed signal, then decode the alphabet it spells.*

This strongly hints at **Morse code** (timed signal) followed by another encoding (the alphabet it spells).

---

## 2. Extract the Timed Signal (Morse)

We analyse the audio envelope to find active segments (tones) and their durations.

```python
import wave, numpy as np

wf = wave.open('signal.wav', 'rb')
sr = wf.getframerate()
n = wf.getnframes()
x = np.frombuffer(wf.readframes(n), dtype=np.int16).astype(np.float32)

win = int(0.01 * sr)          # 10 ms windows
env = np.abs(x).reshape(-1, win).mean(axis=1)
thr = env.max() * 0.2
active = env > thr

segs = []
start = None
for i, a in enumerate(active):
    if a and start is None:
        start = i
    elif not a and start is not None:
        segs.append((start*win, i*win))
        start = None
if start is not None:
    segs.append((start*win, len(active)*win))

segs = [(s/sr, e/sr) for s, e in segs]
print("Segments:", len(segs))
for s, e in segs[:80]:
    print(f"{s:.3f}-{e:.3f}  dur {(e-s):.3f}")
```

The segments come in two clear durations:

- **~0.020 s** → dot `.`
- **~0.060 s** → dash `-`

Gaps also follow Morse timing:

- ~0.020 s → no space (inside a character)
- ~0.060 s → space between characters
- longer → space between words

We build the Morse string automatically:

```python
morse = ""
prev_end = None
for s, e in segs:
    dur = e - s
    sym = '.' if dur < 0.04 else '-'
    if prev_end is not None:
        gap = s - prev_end
        if gap < 0.04:
            pass
        elif gap < 0.1:
            morse += ' '
        else:
            morse += ' / '
    morse += sym
    prev_end = e

print("Morse:", morse)
```

Output:

```
--- .-. ..- .-- . --.. .-.. -.-. .--. -. --.. .-- ... --.. ...-- --- -- ..-. .-- ..-. -.... -- -... ... .... -... ... --. .. --.. -... ...- --. ..... .-. .-- --. -.-- .-. ...- --. -. .-. .-- . -.-- .-.. -.. -- ..- ...-- --. .. --... ..
```

---

## 3. Decode Morse → Base32 String

Using a standard Morse dictionary:

```python
MORSE = {
    '.-':'A','-...':'B','-.-.':'C','-..':'D','.':'E','..-.':'F','--.':'G','....':'H',
    '..':'I','.---':'J','-.-':'K','.-..':'L','--':'M','-.':'N','---':'O','.--.':'P',
    '--.-':'Q','.-.':'R','...':'S','-':'T','..-':'U','...-':'V','.--':'W','-..-':'X',
    '-.--':'Y','--..':'Z','-----':'0','.----':'1','..---':'2','...--':'3','....-':'4',
    '.....':'5','-....':'6','--...':'7','---..':'8','----.':'9'
}

decoded = []
for word in morse.split(' / '):
    for ch in word.split(' '):
        if ch:
            decoded.append(MORSE.get(ch, '?'))
    decoded.append(' ')
b32 = ''.join(decoded).strip().replace(' ', '')
print("Morse decoded:", b32)
```

Result:

```
ORUWEZLCPNZWSZ3OMFWF6MBSHBSGIZBVG5RWGYRVGNRWEYLDMU3GI7I
```

This string contains only uppercase letters `A-Z` and digits `2-7`.  
That is exactly the **Base32 alphabet**.

---

## 4. Base32 Decode → Flag

The string length is 55. Base32 requires padding to a multiple of 8.  
55 mod 8 = 7 → add one `=`.

```python
import base64

s = "ORUWEZLCPNZWSZ3OMFWF6MBSHBSGIZBVG5RWGYRVGNRWEYLDMU3GI7I"
s += '=' * ((8 - len(s) % 8) % 8)
raw = base64.b32decode(s)
print(raw.decode())
```

Output:

```
tibeb{signal_028ddd57ccb53cbace6d}
```

---

## 5. Final Flag

```
tibeb{signal_028ddd57ccb53cbace6d}
```

---

## Tricky / Interesting Points

1. **Timing precision** — The WAV uses exact 20 ms dots and 60 ms dashes, with matching gaps. A simple amplitude envelope threshold works perfectly.
2. **No word spaces** — The Morse decodes to one continuous string. The challenge description says “repeats no words”, which hints there are no word separators.
3. **Base32 alphabet** — After Morse, the string uses only `A-Z` and `2-7`, the standard Base32 character set. Recognising this saves time.
4. **Padding** — Base32 length must be a multiple of 8. The decoded string is 55 chars, so one `=` padding is needed.
---

## One-Shot Python Script

If you want to reproduce everything in one go:

```python
import wave, numpy as np, base64

wf = wave.open('signal.wav', 'rb')
sr = wf.getframerate()
n = wf.getnframes()
x = np.frombuffer(wf.readframes(n), dtype=np.int16).astype(np.float32)

win = int(0.01 * sr)
env = np.abs(x).reshape(-1, win).mean(axis=1)
thr = env.max() * 0.2
active = env > thr

segs = []
start = None
for i, a in enumerate(active):
    if a and start is None:
        start = i
    elif not a and start is not None:
        segs.append((start*win, i*win))
        start = None
if start is not None:
    segs.append((start*win, len(active)*win))
segs = [(s/sr, e/sr) for s, e in segs]

morse = ""
prev_end = None
for s, e in segs:
    dur = e - s
    sym = '.' if dur < 0.04 else '-'
    if prev_end is not None:
        gap = s - prev_end
        if gap < 0.04:
            pass
        elif gap < 0.1:
            morse += ' '
        else:
            morse += ' / '
    morse += sym
    prev_end = e

MORSE = {
    '.-':'A','-...':'B','-.-.':'C','-..':'D','.':'E','..-.':'F','--.':'G','....':'H',
    '..':'I','.---':'J','-.-':'K','.-..':'L','--':'M','-.':'N','---':'O','.--.':'P',
    '--.-':'Q','.-.':'R','...':'S','-':'T','..-':'U','...-':'V','.--':'W','-..-':'X',
    '-.--':'Y','--..':'Z','-----':'0','.----':'1','..---':'2','...--':'3','....-':'4',
    '.....':'5','-....':'6','--...':'7','---..':'8','----.':'9'
}

decoded = []
for word in morse.split(' / '):
    for ch in word.split(' '):
        if ch:
            decoded.append(MORSE.get(ch, '?'))
    decoded.append(' ')
b32 = ''.join(decoded).strip().replace(' ', '')

b32_padded = b32 + '=' * ((8 - len(b32) % 8) % 8)
raw = base64.b32decode(b32_padded)
print(raw.decode())
```

**Flag:** `tibeb{signal_028ddd57ccb53cbace6d}`
