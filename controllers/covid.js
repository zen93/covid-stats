const db = require('../models/db');

function CFR(cases, deaths) {
    if(cases == 0) return { fraction: 0, percent: 0 };
    return { fraction: deaths/cases, percent: (deaths/cases)*100 };
}

function estimateInfected(CFR, deaths) {
    if(CFR.fraction === 0) return 0; 
    return Math.round(deaths/CFR.fraction);
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

function calculateAllStats(data, sourceCountries, estimateCountry, days) {
    let stats = [];
    
    for(const country of sourceCountries) {
        console.log(data);
        let c = data.find( el => el.slug.trim().toLowerCase() === country);
        if(c) {
            let allData = c.data;
            let begin = allData.length - days;
            let recentData = allData.sort((a, b) => new Date(a.Date) - new Date(b.Date)).slice((begin > 0)? begin: 0, allData.length);
            let infectedData = [];
            let e = data.find( el => el.slug.trim().toLowerCase() === estimateCountry);
            if(e) {
                for(let d of recentData) {                
                    let cfr = CFR(d.Confirmed, d.Deaths);                    
                    let allEstimateData = e.data;
                    begin = allEstimateData.length - days;
                    let recentEstimateData = allEstimateData.sort((a, b) => new Date(a.Date) - new Date(b.Date)).slice((begin > 0) ? begin: 0, allData.length);
                    let p = recentEstimateData.find(el => el.Date === d.Date);
                    if(p) {
                        let infected = estimateInfected(cfr, p.Deaths);
                        infectedData.push({ cases: infected, date: p.Date});
                    }
                    
                }
                stats.push({estimateCountry: estimateCountry, sourceCountry: country, data: infectedData });
            }
        }
    }
    return stats;
}

async function covidStats(sourceCountries = [], estimateCountry = '', days) {
    return new Promise(async (resolve, reject) => {
        try {   
            let data = await db.fetchTotalData(sourceCountries, estimateCountry);
            let stats = calculateAllStats(data, sourceCountries, estimateCountry, days);
            resolve(stats);    
        } catch (error) {
            reject(error);
        }
        
    });
};

module.exports.covidStats = covidStats;