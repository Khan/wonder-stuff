import {Router} from "express";
import {getAppEngineInfo} from "../get-app-engine-info";

/**
 * Make the router to handle the /_api routes.
 *
 * These routes are used by our deployment system, among other things.
 *
 * Takes the version string to be returned via the /_api/version route.
 */
export const commonServiceRoutes = (): Router => {
    const {version} = getAppEngineInfo();
    // eslint-disable-next-line @babel/new-cap
    return Router()
        .get("/_api/ping", (req, res) => {
            res.send("pong\n");
        })
        .get("/_api/version", (req, res) => {
            res.send({version});
        })
        .get("/_ah/warmup", (req, res) => {
            res.send("OK\n");
        });
};
