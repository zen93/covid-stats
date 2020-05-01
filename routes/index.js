const url = require('url');
var express = require('express');
var router = express.Router();

const covid = require('../controllers/covid');


router.get('/', async function(req, res, next) {
  try {
    let query = url.parse(req.url, true).query;

    let estimateCountry = '';
    let sourceCountries = [];
    let stats = {};
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
        sourceCountries = sourceCountries.filter((el) => el != '');
      }
      if(query.days) {
        days = parseInt(query.days);
      }
    }
    stats = await covid.covidStats(sourceCountries, estimateCountry, days);
    var statsJSONstring = JSON.stringify({ message: stats });
    var statsJSON = JSON.parse(statsJSONstring);

    var fraction = statsJSON.message.IFREstimate[0].IFR.fraction;
    var IFRpercent = statsJSON.message.IFREstimate[0].IFR.percent;
    var data = statsJSON.message.IFREstimate[0].data;
    var estimateFromSources = statsJSON.message.estimateFromSources;
    var estimate = statsJSON.message.IFREstimate[0].estimateCountry;

    res.render('index', {
      layout: false,
      title: "Home page",
      IFR : IFRpercent,
      dataJson: data,
      estimateFromSourcesJson: estimateFromSources,
      estimateCountry: estimate,
    });
     
  } catch (error) {
    console.log(error.stack);
    res.send({ message: error.message });
  }
  
});

module.exports = router;
