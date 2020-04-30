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
    //res.status(200).send(statsJSON);
    //console.log(statsJSON);
   // statsJSON = {"message":{"IFREstimate":[{"IFR":{"fraction":0.005733333333333333,"percent":0.5733333333333334},"data":[{"cases":275581,"date":"2020-04-20T00:00:00.000Z"},{"cases":307849,"date":"2020-04-21T00:00:00.000Z"},{"cases":337849,"date":"2020-04-22T00:00:00.000Z"},{"cases":352500,"date":"2020-04-23T00:00:00.000Z"},{"cases":375349,"date":"2020-04-24T00:00:00.000Z"},{"cases":382326,"date":"2020-04-25T00:00:00.000Z"},{"cases":382674,"date":"2020-04-26T00:00:00.000Z"},{"cases":396628,"date":"2020-04-27T00:00:00.000Z"},{"cases":410756,"date":"2020-04-28T00:00:00.000Z"},{"cases":429419,"date":"2020-04-29T00:00:00.000Z"}]}],"estimateFromSources":[{"estimateCountry":"sweden","sourceCountry":"germany","data":[{"cases":39467,"date":"2020-04-20T00:00:00.000Z"},{"cases":44088,"date":"2020-04-21T00:00:00.000Z"},{"cases":48384,"date":"2020-04-22T00:00:00.000Z"},{"cases":50482,"date":"2020-04-23T00:00:00.000Z"},{"cases":53755,"date":"2020-04-24T00:00:00.000Z"},{"cases":54754,"date":"2020-04-25T00:00:00.000Z"},{"cases":54804,"date":"2020-04-26T00:00:00.000Z"},{"cases":56802,"date":"2020-04-27T00:00:00.000Z"},{"cases":58825,"date":"2020-04-28T00:00:00.000Z"},{"cases":61498,"date":"2020-04-29T00:00:00.000Z"}]},{"estimateCountry":"sweden","sourceCountry":"korea-south","data":[{"cases":68861,"date":"2020-04-20T00:00:00.000Z"},{"cases":76924,"date":"2020-04-21T00:00:00.000Z"},{"cases":84420,"date":"2020-04-22T00:00:00.000Z"},{"cases":88081,"date":"2020-04-23T00:00:00.000Z"},{"cases":93791,"date":"2020-04-24T00:00:00.000Z"},{"cases":95534,"date":"2020-04-25T00:00:00.000Z"},{"cases":95621,"date":"2020-04-26T00:00:00.000Z"},{"cases":99108,"date":"2020-04-27T00:00:00.000Z"},{"cases":102638,"date":"2020-04-28T00:00:00.000Z"},{"cases":107301,"date":"2020-04-29T00:00:00.000Z"}]}]}};
   // var IFRpercent = statsJSON;
   // res.send (IFRpercent);
    
    var fraction = statsJSON.message.IFREstimate[0].IFR.fraction;
    var IFRpercent = statsJSON.message.IFREstimate[0].IFR.percent;
    var data = statsJSON.message.IFREstimate[0].data;
    var estimateFromSources = statsJSON.message.estimateFromSources;

    res.render('index', {
      layout: false,
      title: "Home page",
      IFR : IFRpercent,
      dataJson: data,
      estimateFromSourcesJson: estimateFromSources,
    }
      );
     
  } catch (error) {
    console.log(error.stack);
    res.send({ message: error.message });
  }
  
});

module.exports = router;
