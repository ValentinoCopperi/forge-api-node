import { Request } from "express";


/**
 * Campos comunes para correlacionar logs con el request HTTP (errores y éxitos).
 * `url` usa `originalUrl` (ruta bajo el prefijo montado + query).
 */
export function getHttpRequestLogContext(req: Request) {

    return {
        method: req.method,
        url: req.originalUrl,
        request_id: req.request_id,
    };
}
