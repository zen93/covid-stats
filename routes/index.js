const url = require('url');

var express = require('express');
var router = express.Router();

const covid = require('../controllers/covid');

router.get('/', async function(req, res, next) {
  try {
    let query = url.parse(req.url, true).query;

    let estimateCountry = '';
    let sourceCountries = [];
    let stats = [];
    let days = 10;
    
    if(query) {
      if(query.estimate) {
        estimateCountry = query.estimate.trim().toLowerCase();
      }
      if(query.source) {
        sourceCountries = query.source.trim().split(',');
        for(let i = 0; i < sourceCountries.length; i++) {
          sourceCountries[i] = sourceCountries[i].trim().toLowerCase();
        }
      }
      if(query.days) {
        days = parseInt(query.days);
      }
    }
    stats = await covid.covidStats(sourceCountries, estimateCountry, days);
    res.status(200).send(JSON.stringify({ message: stats }));
  } catch (error) {
    console.log(error.stack)
    res.send({ message: error.message });
  }
  
});

module.exports = router;
