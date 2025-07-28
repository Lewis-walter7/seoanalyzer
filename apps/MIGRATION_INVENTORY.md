# Server Auth Centralization - Migration Inventory

**Branch:** `feat/server-auth-centralization`
**Date:** $(date)
**Purpose:** Inventory of files to delete/move during auth centralization from client to server

## Files with @prisma/client References in apps/client

### Core Database/Prisma Files
| File Path | Action | Notes |
|-----------|--------|-------|
| `apps/client/lib/prisma.ts` | **DELETE** | Prisma client singleton - will be centralized on server |
| `apps/client/lib/auth.ts` | **MAJOR REFACTOR** | Contains PrismaClient instantiation and all auth logic |
| `apps/client/prisma/seed.ts` | **MOVE TO SERVER** | Database seeding should be server-side |

### API Routes with Prisma
| File Path | Action | Notes |
|-----------|--------|-------|
| `apps/client/app/api/auth/register/route.ts` | **DELETE/MOVE** | User registration - move to server API |

### Package Dependencies
| File Path | Action | Notes |
|-----------|--------|-------|
| `apps/client/package.json` | **UPDATE** | Remove @prisma/client dependency |
| `apps/client/bun.lock` | **UPDATE** | Will be updated when package.json changes |

## NextAuth Routes in apps/client/app/api/auth

### Authentication API Routes
| File Path | Action | Notes |
|-----------|--------|-------|
| `apps/client/app/api/auth/[...nextauth]/route.ts` | **DELETE** | NextAuth handler - auth will be server-side |
| `apps/client/app/api/auth/register/route.ts` | **DELETE** | Registration route - move to server |

## Files with NextAuth/Authentication References

### Core Auth Configuration
| File Path | Action | Notes |
|-----------|--------|-------|
| `apps/client/lib/auth.ts` | **MAJOR REFACTOR** | Core auth config - needs complete rework for server auth |
| `apps/client/lib/auth-client.ts` | **REFACTOR** | Client-side auth utilities - adapt for server auth |
| `apps/client/lib/jwt.ts` | **REVIEW/REFACTOR** | JWT handling - may need server-side equivalent |
| `apps/client/types/next-auth.d.ts` | **DELETE** | NextAuth types - won't be needed |

### Middleware & Core App Files
| File Path | Action | Notes |
|-----------|--------|-------|
| `apps/client/middleware.ts` | **MAJOR REFACTOR** | Auth middleware - needs to work with server auth |
| `apps/client/app/providers.tsx` | **REFACTOR** | Remove NextAuth SessionProvider |

### UI Components with Auth
| File Path | Action | Notes |
|-----------|--------|-------|
| `apps/client/app/components/navbar/navbar.tsx` | **REFACTOR** | Update auth state management |
| `apps/client/app/components/sidebar/sidebar.tsx` | **REFACTOR** | Update auth state management |
| `apps/client/app/components/dashboard/CreateProjectModal.tsx` | **REFACTOR** | Update auth context usage |
| `apps/client/components/SubscriptionPlans.tsx` | **REFACTOR** | Update auth context usage |

### Auth Pages
| File Path | Action | Notes |
|-----------|--------|-------|
| `apps/client/app/login/page.tsx` | **MAJOR REFACTOR** | Login page - adapt for server auth |
| `apps/client/app/signup/page.tsx` | **MAJOR REFACTOR** | Signup page - adapt for server auth |

### API Routes with Auth Dependencies
| File Path | Action | Notes |
|-----------|--------|-------|
| `apps/client/app/api/subscription/me/route.ts` | **REFACTOR** | Update auth verification |
| `apps/client/app/api/projects/route.ts` | **REFACTOR** | Update auth verification |

### Utility Files
| File Path | Action | Notes |
|-----------|--------|-------|
| `apps/client/lib/api.ts` | **REFACTOR** | Update for server auth endpoints |
| `apps/client/lib/axios.ts` | **REFACTOR** | Update auth token handling |

### Package Dependencies (NextAuth)
| File Path | Action | Notes |
|-----------|--------|-------|
| `apps/client/package.json` | **UPDATE** | Remove next-auth dependencies |

## Migration Priority Order

### Phase 1: Server Setup
1. Set up auth endpoints on server
2. Set up Prisma client on server
3. Move/recreate auth configuration server-side

### Phase 2: Client Refactoring  
1. Remove `apps/client/lib/prisma.ts`
2. Remove `apps/client/app/api/auth/` directory entirely
3. Update `apps/client/lib/auth.ts` for server-based auth
4. Refactor middleware and providers

### Phase 3: Component Updates
1. Update all UI components to use new auth system
2. Update API routes to verify auth with server
3. Update auth pages (login/signup)

### Phase 4: Cleanup
1. Remove NextAuth and Prisma dependencies from client package.json
2. Remove type definitions
3. Update documentation

## Risk Assessment

### High Risk Files (Complete Rewrite Required)
- `apps/client/lib/auth.ts` - Core auth logic
- `apps/client/middleware.ts` - Auth verification
- `apps/client/app/providers.tsx` - Auth context

### Medium Risk Files (Significant Changes)
- All UI components with auth hooks
- API routes with auth verification
- Login/signup pages

### Low Risk Files (Minor Updates)
- Package configuration files
- Documentation files

## Notes
- All Prisma client usage must be moved to server-side
- NextAuth session management needs complete replacement
- JWT handling strategy needs to be defined for server auth
- CORS configuration may need updates for cross-app communication
