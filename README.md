# SodaWiki
> First pass at creating a socrata2localwiki data sync tool with javascript.
> Socrata's open data api is called SODA. So, SodaWiki.
> Because soda.

This module is super messy still. You can see in the code and in the usage example below a bunch of notes I took while writing it. Have ideas for fixing some of the problems? Fork this thing.

This will work for really simple situations, but for complex datasets hosted by socrata you might need to fork this project and make changes to the SodaWiki.sync method. Go for it. Feel free to submit pull requests for general improvements.

Tested with node v0.10.0.

This module depends on [node-localwiki-client](https://github.com/codeforseattle/node-localwiki-client) and [sodajs-socrata](https://github.com/sethvincent/sodajs-socrata).

It could probably work in the browser using browserify, but then you'd be sending your localwiki api key around in the open. That could be a bummer.

### TODO:
 - create maps  
 - create tags  
 - move table generation stuff to node-localwiki-client
 - rework crazy attribute-mapping
 - general cleanup.

### Usage:
```
var SodaWiki = require('SodaWiki');

var sodawiki = new SodaWiki({
  // localwiki options
  localwiki: {
    url: "some.localwiki.url", // like: http://seattlewiki.net
    user: process.env.LOCALWIKI_USER,
    apikey: process.env.LOCALWIKI_API_KEY
  },

  // socrata options
  socrata: {
    url: "https://data.seattle.gov"
  }
});

var options = {
  // the id of the data set on socrata. 
  // find it in the url: https://data.seattle.gov/Community/beaches-in-seattle/9mk3-vhgr
  resource: '9mk3-vhgr',

  // Tell localwiki which data attributes
  // to use for generating the page and related resources.
  // Put the key of the data set attribute as the value in this object.
  // This is confusing, right? is there a better solution?
  // I got it smart enough to grab the first value from nested objects,
  // but it assumes a really simple, flat data structure. not ideal.
  attributesMap: {
    pageTitle: "common_name",
    content: "common_name",
    table: {
      address: "address",
      website: "website"
    },
    lat_lon: {
      latitude: "location",
      longitude: "location"
    },
    tags: ["city_feature"]
  },

  // add custom attributes in addition to what's available from the socrata dataset
  customAttributes: {
    content: "<p>Beaches are really super fun and you're just going to have to deal with that.</p>",
    tags: ["fun", "recreation", "sand", "water access"],
    titleSuffix: " (Beach)" 
  }
}

// all that config just for one tiny method! lame? useful?
// the attributesMap stuff could potentially be rolled in to the localwiki api client
// what do other people do in this situation? of mapping attributes to other attributes?

sodawiki.sync(options);
```

### Delete the pages you've created using the same options object:
```
sodawiki.rollback(options)
```
This helps with experimenting.