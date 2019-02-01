let getParam = (params, property, defaulfValue) => {
    if(params.hasOwnProperty(property) && params[property] !== undefined ){
        return params[property];
    }
    return defaulfValue;
}

module.exports = {
    getParam
}