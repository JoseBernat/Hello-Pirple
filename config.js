/*
*
*CREATE AND EXPORT CONFIG VARS
*
*
*
*/

//container for all environments
var environments = {}

//Staging (defautl) object :
environments.staging = {
    'httpPort' : 3000,
    'httpsPort' : 3001,
    'envName' : 'staging'
};

environments.production = {
    'httpPort' : 5000,
    'httpsPort' : 5001,
    'envName' : 'production'
};

//Determine which environment was passed in command line argument:
var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

//Check that current environment is defined, if not, default to staging:
var environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging

//Export module:
module.exports = environmentToExport;