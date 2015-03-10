//Sample data for {{sample.id}}
exports.samplePost = {
  {%- for property in sample.properties -%}
    {%- if property.type === 'int' || property.type === 'integer' -%}
      {%- set postValue = '2' -%}
    {%- elseif property.type === 'string' -%}
      {%- set postValue = 'sampleString' -%}
    {%- elseif property.type === 'object' -%}
      {%- set postValue = '{key: value}' -%}
    {%- endif -%}
    {%- if property.name === 'id' -%}
      {%- set postValue = 1 -%}
    {%- endif -%}
    '{{property.name}}': '{{postValue}}'
  {%- endfor -%}
}

exports.samplePut = {
  {%- for property in sample.properties -%}
    {%- if property.type === 'int' || property.type === 'integer' -%}
      {%- set putValue = '4' -%}
    {%- elseif property.type === 'string' -%}
      {%- set putValue = 'UpdatedsampleString' -%}
    {%- elseif property.type === 'object' -%}
      {%- set putValue = '{key: Updatedvalue}' -%}
    {%- endif -%}
    {%- if property.name === 'id' -%}
      {%- set putValue = 1 -%}
    {%- endif -%}
    '{{property.name}}': '{{putValue}}'
  {%- endfor -%}
}