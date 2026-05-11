'use strict';
require('dotenv').config();
const { ADMIN_BYPASS_ROLES } = require('../constants/roles');
console.log("ROLES:", [...ADMIN_BYPASS_ROLES]);
console.log("HAS SYSTEM_ADMIN:", ADMIN_BYPASS_ROLES.has('SYSTEM_ADMIN'));
