export const ctfEvent = 'Tibeb / QIYAS CTF'
export const ctfMonth = 'October 2026'

export const writeupCategories = [
  { id: 'all', label: 'All write-ups' },
  { id: 'web', label: 'Web' },
  { id: 'cryptography', label: 'Cryptography' },
  { id: 'binary', label: 'Binary exploitation' },
  { id: 'reversing', label: 'Reverse engineering' },
  { id: 'forensics', label: 'Forensics' },
  { id: 'misc', label: 'Miscellaneous' },
] as const

export type WriteupCategoryFilter = typeof writeupCategories[number]['id']
export type WriteupCategory = Exclude<WriteupCategoryFilter, 'all'>

export interface Writeup {
  slug: string
  title: string
  category: WriteupCategory
  summary: string
  topics: string[]
  points?: number
  difficulty?: 'Easy' | 'Medium' | 'Hard'
  featured?: boolean
}

export const writeups: Writeup[] = [
  {
    slug: 'old-paper', title: 'Old Paper', category: 'web', points: 100,
    summary: 'Follow an HTML comment and a robots.txt clue to uncover a retired archive note.',
    topics: ['Reconnaissance', 'HTML source', 'robots.txt'],
  },
  {
    slug: 'catalogue-of-secrets', title: 'Catalogue of Secrets', category: 'web', points: 200,
    summary: 'Trace a one-column SQLite search into a UNION-based SQL injection and recover the hidden record.',
    topics: ['SQL injection', 'SQLite', 'UNION SELECT'],
  },
  {
    slug: 'someone-elses-receipt', title: 'Someone Else’s Receipt', category: 'web', points: 150,
    summary: 'Use a leaked invoice reference to examine a missing object-level authorization check.',
    topics: ['IDOR', 'Access control', 'Authorization'],
  },
  {
    slug: 'pass-office', title: 'Pass Office', category: 'web', points: 300,
    summary: 'Read the JWT verification routine and identify a signature bypass through an unverified algorithm.',
    topics: ['JWT', 'Authentication', 'alg=none'],
  },
  {
    slug: 'the-template-loom', title: 'The Template Loom', category: 'web', points: 400, featured: true,
    summary: 'Investigate Jinja2 template injection and compare the access forms accepted by the challenge.',
    topics: ['SSTI', 'Jinja2', 'Input filtering'],
  },
  {
    slug: 'shift-change', title: 'Shift Change', category: 'cryptography',
    summary: 'Recover a Caesar shift from the known flag prefix while leaving punctuation and digits intact.',
    topics: ['Caesar cipher', 'Known plaintext', 'Python'],
  },
  {
    slug: 'one-pad-two-letters', title: 'One Pad, Two Letters', category: 'cryptography',
    summary: 'Recover a reused one-time-pad keystream from a known dispatch and decode a second message.',
    topics: ['One-time pad', 'XOR', 'Keystream reuse'],
  },
  {
    slug: 'shared-workshop', title: 'Shared Workshop', category: 'cryptography',
    summary: 'Factor two RSA moduli with a shared prime using a greatest-common-divisor calculation.',
    topics: ['RSA', 'Shared prime', 'GCD'],
  },
  {
    slug: 'correction-window', title: 'Correction Window', category: 'cryptography',
    summary: 'Use a zero-plaintext edit to recover the keystream of an AES-CTR encrypted memo.',
    topics: ['AES-CTR', 'Edit oracle', 'XOR'],
  },
  {
    slug: 'nonce-echo', title: 'Nonce Echo', category: 'cryptography',
    summary: 'Recover a DSA private key from reused-nonce signatures, verify it, and decode the sealed message.',
    topics: ['DSA', 'Nonce reuse', 'Modular arithmetic'],
  },
  {
    slug: 'narrow-counter', title: 'Narrow Counter', category: 'binary',
    summary: 'Turn a 16-bit ticket-total truncation into a modular inverse problem.',
    topics: ['Integer truncation', 'C', 'Modular inverse'],
  },
  {
    slug: 'printf-post', title: 'Printf Post', category: 'binary', points: 250,
    summary: 'Recover flag bytes from variadic arguments exposed by an uncontrolled printf format string.',
    topics: ['Format string', 'printf', 'Stack inspection'],
  },
  {
    slug: 'night-return', title: 'Night Return', category: 'binary', points: 300, difficulty: 'Medium',
    summary: 'Analyze the challenge’s stack layout and redirect a saved return address to the reward function.',
    topics: ['Buffer overflow', 'ret2win', 'x86-64'],
  },
  {
    slug: 'borrowed-badge', title: 'Borrowed Badge', category: 'binary', points: 400, difficulty: 'Hard', featured: true,
    summary: 'Follow a dangling heap pointer and the observed allocation reuse to replace a badge’s fields.',
    topics: ['Use-after-free', 'Heap allocation', 'Struct layout'],
  },
  {
    slug: 'two-seals', title: 'Two Seals', category: 'binary', points: 500, difficulty: 'Hard',
    summary: 'Build a small ROP chain that supplies two arguments to the vault function.',
    topics: ['ROP', 'Calling convention', 'Stack alignment'],
  },
  {
    slug: 'xor-gate', title: 'XOR Gate', category: 'reversing',
    summary: 'Read an ELF checker’s disassembly and invert its bytewise XOR comparison.',
    topics: ['ELF', 'Disassembly', 'XOR'],
  },
  {
    slug: 'tiny-rotor', title: 'Tiny Rotor', category: 'reversing', points: 250,
    summary: 'Reverse a byte transformation that combines a rotation, an XOR, and an index-dependent value.',
    topics: ['Bit rotation', 'Checker analysis', 'Python'],
  },
  {
    slug: 'museum-machine', title: 'Museum Machine', category: 'reversing',
    summary: 'Decode a custom virtual machine’s instruction set and reconstruct the input checked by its bytecode.',
    topics: ['Virtual machine', 'Bytecode', 'Instruction decoding'],
  },
  {
    slug: 'pocket-webassembly', title: 'Pocket WebAssembly', category: 'reversing',
    summary: 'Inspect a WebAssembly module’s data and check routine to recover its expected input.',
    topics: ['WebAssembly', 'WASM', 'Static analysis'],
  },
  {
    slug: 'sixteen-brass-dials', title: 'Sixteen Brass Dials', category: 'reversing',
    summary: 'Model the checker as modular linear equations and reconstruct its 37-byte input.',
    topics: ['Linear equations', 'Modular arithmetic', 'Checker analysis'],
  },
  {
    slug: 'after-the-last-pixel', title: 'After the Last Pixel', category: 'forensics', points: 100,
    summary: 'Find a ZIP archive appended after a PNG’s IEND chunk, carve it, and decode its message.',
    topics: ['PNG', 'File carving', 'Appended archive'],
  },
  {
    slug: 'the-logbook', title: 'The Logbook', category: 'forensics', points: 250,
    summary: 'Filter a transfer from noisy logs and reassemble its Base64 chunks by sequence number.',
    topics: ['Log analysis', 'Sequence reconstruction', 'Base64'],
  },
  {
    slug: 'postcards-in-dns', title: 'Postcards in DNS', category: 'forensics',
    summary: 'Reassemble numbered DNS query labels after removing retries and background traffic.',
    topics: ['DNS', 'PCAP', 'Base32'],
  },
  {
    slug: 'pixel-weave', title: 'Pixel Weave', category: 'forensics', points: 300, difficulty: 'Medium', featured: true,
    summary: 'Recover a hidden message from an image’s red-channel bits and a four-byte length header.',
    topics: ['Steganography', 'LSB', 'Image analysis'],
  },
  {
    slug: 'erased-ledger', title: 'Erased Ledger', category: 'forensics', points: 400, difficulty: 'Hard',
    summary: 'Inspect SQLite free pages and recover a deleted dispatch envelope from the database bytes.',
    topics: ['SQLite', 'Deleted data', 'Freelist recovery'],
  },
  {
    slug: 'campus-footprints', title: 'Campus Footprints', category: 'misc', points: 150, difficulty: 'Easy',
    summary: 'Filter a fictional campus archive by room and time, then select the latest revision for each seal.',
    topics: ['JSON', 'Archive filtering', 'Revision selection'],
  },
  {
    slug: 'matryoshka-parcel', title: 'Matryoshka Parcel', category: 'misc',
    summary: 'Follow magic bytes through gzip, Base64, bzip2, and ZIP layers to reach the final dispatch.',
    topics: ['Magic bytes', 'Compression', 'Nested encoding'],
  },
  {
    slug: 'midnight-signal', title: 'Midnight Signal', category: 'misc', points: 300, difficulty: 'Medium',
    summary: 'Inspect an audio signal, decode its Morse timing, and recover the Base32 message it spells.',
    topics: ['Audio analysis', 'Morse code', 'Signal timing'],
  },
  {
    slug: 'repair-shop', title: 'Repair Shop', category: 'misc', points: 300, difficulty: 'Medium',
    summary: 'Correct single-bit errors in Hamming(7,4) codewords and reconstruct the transmitted bytes.',
    topics: ['Hamming code', 'Error correction', 'Bit layout'],
  },
  {
    slug: 'caravan-routes', title: 'Caravan Routes', category: 'misc',
    summary: 'Find the cheapest directed route with Dijkstra’s algorithm and join its edge labels.',
    topics: ['Dijkstra', 'Graph algorithms', 'Shortest path'],
  },
]
