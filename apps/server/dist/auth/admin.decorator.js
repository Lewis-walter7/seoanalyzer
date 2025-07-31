"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequireAdmin = exports.IS_ADMIN_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.IS_ADMIN_KEY = 'isAdmin';
const RequireAdmin = () => (0, common_1.SetMetadata)(exports.IS_ADMIN_KEY, true);
exports.RequireAdmin = RequireAdmin;
