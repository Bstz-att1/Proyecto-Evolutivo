// ======================================================================
//                     EXPORTACIONES | TASK.API.JS
// ======================================================================
export {
    taskPost,
    taskGet,
    taskGetByUser,
    taskPut,
    taskPatch,
    taskDelete
} from './tasks.api.js';

// ======================================================================
//                     EXPORTACIONES | USERS.API.JS
// ======================================================================
export {
    userGet,
    userGetById,
    userPost,
    userPut,
    userPatch,
    userDelete
} from './users.api.js';

// ======================================================================
//                     EXPORTACIONES | AUTH.API.JS
// ======================================================================
export {
    authLogin,
    authRefresh,
    authLogout
} from './auth.api.js';

// ======================================================================
//                     EXPORTACIONES | ROLES.API.JS
// ======================================================================
export {
    roleGet,
    roleGetById,
    roleGetPermissionsById,
    rolePost,
    rolePut,
    rolePatch,
    roleDelete
} from './roles.api.js';
