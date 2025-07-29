export { authRouter } from './auth.controller';
export { 
  authService, 
  AuthService, 
  User, 
  LoginCredentials, 
  RegisterCredentials, 
  JWTPayload 
} from './auth.service';
export {
  authenticateJWT,
  optionalAuthenticateJWT,
  fastifyAuthenticateJWT,
  fastifyOptionalAuthenticateJWT,
  requireAuth,
  fastifyRequireAuth,
  isAuthenticated,
  isFastifyAuthenticated,
  AuthenticatedRequest,
  AuthenticatedFastifyRequest
} from './auth.middleware';
