import {Router} from "express";
import asyncHandler from "express-async-handler";

import type {WarmUpHandlerFn} from "./types";

/**
 * Make the router to handle the /_api routes.
 *
 * Takes the version string to be returned via the /_api/version route.
 */
export const makeCommonServiceRouter = (
    version: string,
    warmUpHandler?: WarmUpHandlerFn,
): Router =>
    // eslint-disable-next-line @babel/new-cap
    Router()
        .get("/_api/ping", (req, res) => {
            res.send("pong\n");
        })
        .get("/_api/version", (req, res) => {
            res.send({version});
        })
        .get(
            "/_ah/warmup",
            asyncHandler(async (req, res, next) => {
                await warmUpHandler?.(req.headers);
                res.send("OK\n");
            }),
        );
