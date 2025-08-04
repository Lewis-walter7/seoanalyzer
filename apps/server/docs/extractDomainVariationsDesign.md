# extractDomainVariations Design Document

## Overview
This document outlines the design for the `extractDomainVariations` algorithm. It aims to provide a systematic approach to domain variation extraction by normalizing URLs and generating all potential domain combinations.

## Objectives
- Normalize protocols and trailing slashes in URLs.
- Generate variations for root domains, sub-domains, and plain hostnames.
- Utilize a public suffix library to isolate and work with the effective top-level domain (eTLD+1).

## Existing Utilities
The existing codebase contains URL utilities in `url.util.ts`. The functions `normalizeUrl` and `resolveUrl` can be leveraged to assist in URL handling.

## Implementation Details

### Functionality
1. **Normalize URL**
   - Remove protocols (e.g., `http://`, `https://`).
   - Normalize case and remove trailing slashes unless it's the root path.

2. **Extract Domain Variations**
   - Produce variations: root domain, `.root_domain`, `www.root_domain`.
   - Handle subdomains and plain hostname.
   - Use a public suffix list library to focus on the effective TLD (eTLD+1).

3. **Leverage Existing Utilities**
   - Integrate with `url.util.ts` for consistency and reusability.

### Algorithm Steps
1. Import a public suffix list library (e.g., `tldts`).
2. Define the function signature as follows:
   ```typescript
   export function extractDomainVariations(url: string): string[] {
       // Implementation goes here
   }
   ```
3. Inside the function:
   - Use `normalizeUrl` to clean the URL.
   - Employ the public suffix library to parse the eTLD.
   - Compile domain variations as needed.

## Test Matrix
The test matrix consists of various scenarios to ensure the algorithm handles common cases correctly:

| Test Case                          | Input URL                               | Expected Variations                                          | Notes                                 |
|------------------------------------|-----------------------------------------|--------------------------------------------------------------|---------------------------------------|
| Basic Domain                       | `http://example.com`                    | `example.com`, `.example.com`, `www.example.com`            | Test with root domain only            |
| Subdomain                          | `https://blog.example.com`              | `example.com`, `blog.example.com`, `.example.com`, `www.example.com` | Include subdomains                  |
| Protocol Normalization             | `HtTp://example.com/`                   | `example.com`, `.example.com`, `www.example.com`            | Ensure protocol is handled           |
| Trailing Slash Removal             | `https://example.com/`                  | `example.com`, `.example.com`, `www.example.com`            | Remove slashes except for root       |
| Effective TLD                      | `https://example.co.uk`                 | `example.co.uk`, `.example.co.uk`, `www.example.co.uk`      | Utilize library for effective TLD    |
| Invalid URL                        | `invalid-url`                           | `[]` (empty array)                                          | Handle malformed URLs gracefully     |
