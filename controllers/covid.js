const db = require('../models/db');

function CFR(cases, deaths) {
    return { fraction: deaths/cases, percent: (deaths/cases)*100 };
}

function estimateInfected(CFR, deaths) {
    return deaths/CFR.fraction;
    }

    function averageCFR(allCFR) {
    let sum = 0.0;
    for(const CFR of allCFR) {
        sum += CFR.fraction;
    }
    sum = sum/allCFR.length;
    return {fraction: sum, percent: sum*100 };
}

function calculateStats(data, sourceCountries, estimateCountry) {
    let stats = [], allCFR = []; 
    for(const country of sourceCountries) {
        let c = data.find( el => el.country.trim().toLowerCase() === country);
        
        if(c) {
        let cfr = CFR(c.cases, c.deaths);
        allCFR.push(cfr);
        let e = data.find( el => el.country.trim().toLowerCase() === estimateCountry);
        if(e) {
            let infected = estimateInfected(cfr, e.deaths);
            stats.push({ estimateCountry: e.country, infected: infected, sourceCountry: c.country})
        }
        }
    }
    if(allCFR.length > 0) {
        let CFR = averageCFR(allCFR);
        let e = data.find( el => el.country.trim().toLowerCase() === estimateCountry);
        if(e) {
        let infected = estimateInfected(CFR, e.deaths);
        stats.push({ estimateCountry: e.country, infected: infected, sourceCountry: 'all'})
        }
    }
    return stats;
}

async function covidStats(sourceCountries = [], estimateCountry = '') {
    return new Promise(async (resolve, reject) => {    
        let data = await db.fetchData();
        stats = calculateStats(data, sourceCountries, estimateCountry);
        resolve(stats);
    });
};

module.exports.covidStats = covidStats;