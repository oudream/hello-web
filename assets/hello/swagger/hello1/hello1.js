var SwaggerPetstore = require('./javascript/src/index');
SwaggerPetstore.ApiClient.basePath = 'http://localhost:2288/v2';
var apiInstance = new SwaggerPetstore.UserApi();
var body = new SwaggerPetstore.User(); // User | Created user object
var callback = function(error, data, response) {
    if (error) {
        window.document.getElementById('systemInfoEd').innerHTML = JSON.stringify(error);
        console.error(error);
    }
    else {
        window.document.getElementById('systemInfoEd').innerHTML = JSON.stringify('API called successfully.');
        window.document.getElementById('dataInfoEd').innerHTML = JSON.stringify(data);
        console.log('API called successfully.');
        console.log(data);
    }
};
apiInstance.createUser(body, callback);
