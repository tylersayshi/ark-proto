# saving llm output that seems useful

## Differences in raw JSON Schema to Lexicon

Similarities (no real conversion needed):

- Both use type, properties, required fields identically
- Array structure is the same (items field)
- Object structure is the same
- Primitive types mostly align

Key differences:

1. Type normalization: JSON Schema's "number" → Lexicon's "integer" (line 128-129)
2. Missing Lexicon-specific types: The code doesn't handle several Lexicon types that have no JSON Schema equivalent:

   - "bytes", "cid-link", "blob" (defined in LexiconPrimitive at lines 74-76)
   - "ref" (references to other definitions)
   - "union" (discriminated unions)

3. Missing JSON Schema features: The code ignores many JSON Schema constraints that Lexicon supports:
   - String: minLength, maxLength, format (defined at lines 78-79 but never mapped)
   - Integer: minimum, maximum (defined at lines 80-81 but never mapped)
   - Array: minLength, maxLength (defined at lines 64-65 but never mapped)

The conversion is essentially a pass-through for basic types. The real work would be:

1. Mapping JSON Schema format hints to Lexicon's special types (bytes, cid-link, blob)
2. Preserving validation constraints
3. Handling $ref → Lexicon ref conversion
4. Handling oneOf/anyOf → Lexicon union conversion
