/* eslint-disable no-console */
// @flow
switch (process.env.NODE_ENV) {
    default:
    case "production":
        console.log("Hello production World!");
        break;

    case "development":
        console.log("Hello development World!");
        break;

    case "test":
        console.log("Hello test World!");
        break;
}
