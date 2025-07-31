"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Public = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("./auth.guard");
const Public = () => (0, common_1.SetMetadata)(auth_guard_1.IS_PUBLIC_KEY, true);
exports.Public = Public;
