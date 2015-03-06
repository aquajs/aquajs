var path = require('path');
var {{ controllerName }} = require( path.join($dirPaths.controllersDir,'{{ controllerName }}'));

var {{ routerName }} = function(app){
  {%- for apiMethod in apiMethods -%}
    {%- for operation in apiMethod.operations -%}
        app.{{operation.httpMethod|lower}}('{{ apiMethod.path }}',  {{ controllerName }}.{{ operation.nickname }});
    {%- endfor -%}
  {%- endfor -%}
};

module.exports = {{ routerName }};