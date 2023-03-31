// @ts-expect-error This is what we want and I don't get why TS doesn't like it
window["__jsdom_env_register"](() => {
    // This is where we can return our result.
    return Promise.resolve({
        // @ts-expect-error We know that this does exist off window.
        body: `You asked us to render ${window._API.url}`,
        status: 200,
        headers: {},
    });
});
