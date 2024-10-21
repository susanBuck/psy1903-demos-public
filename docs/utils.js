function getCountFromUrl(defaultCount) {
    const queryString = window.location.search; // ?count=4
    const params = {};

    queryString.substring(1).split('&').forEach(param => {
        const [key, value] = param.split('=');
        params[key] = decodeURIComponent(value);
    });

    return params.count ?? defaultCount;
}