var Soda = require('sodajs-socrata');
var Wiki = require('node-localwiki-client');

module.exports = SodaWiki;

function SodaWiki(options){
  this.sodaOptions = options.socrata;
  this.wikiOptions = options.localwiki;

  // CREATE LOCALWIKI CLIENT
  // We're importing content to localwiki, so 
  // an api key is required.
  this.wiki = new Wiki({
    url: this.wikiOptions.url,
    user: this.wikiOptions.user,
    apikey: this.wikiOptions.apikey
  });

  // CREATE SOCRATA CLIENT
  this.soda = new Soda({
    url: this.sodaOptions.url
  });
}

SodaWiki.prototype.sync = function(options){
  this.resource = options.resource;
  this.attributesMap = options.attributesMap;
  this.customAttributes = options.customAttributes;
  var self = this;

  this.soda.all({
    resource: this.resource,
    success: function(data){
      for (item in data){    
        var table = self.processTable(data, self.attributesMap, self.customAttributes);
        
        self.wiki.create({
          data: {
            'name': data[item][self.attributesMap.pageTitle] + self.customAttributes.titleSuffix,
            'content': table + data[item][self.attributesMap.content] + self.customAttributes.content,
          },
          success: function(data){
            if (options.success) options.success(data);
          }
        });
      }
    }
  });

}

// TODO: move this table generation stuff to node-localwiki-client
SodaWiki.prototype.processTable = function(data, attributesMap, customAttributes, callback){
  var table_start = '<table class="details" style="width: 424px;"><tbody';
  var table_row_key_start = '<tr><td style="background-color: rgb(232, 236, 239);"><strong>';
  var table_row_key_end = '</strong></td></tr>';
  var table_row_value_start = '<tr><td>';
  var table_row_value_end = '</td></tr>';
  var table_end = '</tbody></table>';

  var table = table_start;

  for (key in attributesMap.table) {
    var label = table_row_key_start + capitalize(attributesMap.table[key]) + table_row_key_end;
    var value = table_row_value_start + data[item][attributesMap.table[key]] + table_row_value_end;
    table += label;

    if (typeof data[item][attributesMap.table[key]] === 'object') {
      var nestedObject = data[item][attributesMap.table[key]];
      for (_key in nestedObject) {
        table += table_row_value_start + nestedObject[_key] + table_row_value_end;
      }
    } else {
      table += value;
    }
  }
  table += table_end;
  return table;
}

SodaWiki.prototype.rollback = function(options){
  this.resource = options.resource;
  this.attributesMap = options.attributesMap;
  this.customAttributes = options.customAttributes;
  var self = this;

  this.soda.all({
    resource: this.resource,
    success: function(data){
      for (item in data){       
        self.wiki.fetch({
          identifier: data[item][self.attributesMap.pageTitle] + self.customAttributes.titleSuffix,
          success: function(resource){
            resource.delete();
          }
        });
      }
    }
  });
}

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}