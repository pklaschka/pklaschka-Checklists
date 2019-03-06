/*
 * Copyright (c) 2019 by Pablo Klaschka
 */

const screenshot = require('screenshot-desktop');

module.exports = async function () {
    const img = await screenshot();
    return `data:image/jpeg;base64,` + img.toString('base64');
};