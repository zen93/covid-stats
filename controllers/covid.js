const db = require('../models/db');

function CFR(cases, deaths) {
    if(cases == 0) return { fraction: 0, percent: 0 };
    return { fraction: deaths/cases, percent: (deaths/cases)*100 };
}

function estimateInfected(CFR, deaths) {
    if(CFR.fraction === 0) return 0; 
    return Math.round(deaths/CFR.fraction);
}

function calculateSourceStats(data, sourceCountries, estimateCountry, days) {
    let stats = [];
    
    for(const country of sourceCountries) {
        let c = data.find( el => el.slug.trim().toLowerCase() === country);
        if(c) {
            let allData = c.data;
            let begin = allData.length - days;
            let recentData = allData.sort((a, b) => new Date(a.Date) - new Date(b.Date)).slice((begin > 0)? begin: 0, allData.length);
            let infectedData = [];
            let e = data.find( el => el.slug.trim().toLowerCase() === estimateCountry);
            if(e) {
                let currentData = recentData[recentData.length - 1];
                let cfr = CFR(currentData.Confirmed, currentData.Deaths);                    
                for(let d of recentData) {                
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

function averageIFR(allIFR) {
    let sum = 0.0;
    for(const IFR of allIFR) {
        sum += IFR.IFR;
    }
    sum = sum/allIFR.length;
    return {fraction: sum/100, percent: sum };
}

function estimateTrueInfected(IFR, deaths) {
    if(!(IFR.fraction > 0.0)) return 0; 
    return Math.round(deaths/IFR.fraction);
}

function calculateIFRStats(data, IFRData, estimateCountry, days) {
    let stats = [];
    let e = data.find( el => el.slug.trim().toLowerCase() === estimateCountry);    
    if(e) {
        let infectedData = [];

        let allData = e.data;
        let begin = allData.length - days;
        let recentData = allData.sort((a, b) => new Date(a.Date) - new Date(b.Date)).slice((begin > 0)? begin: 0, allData.length);

        let IFR = averageIFR(IFRData);
        for(let d of recentData) {
            let infected = estimateTrueInfected(IFR, d.Deaths);
            infectedData.push({ cases: infected, date: d.Date });
        }
        stats.push({ IFR: IFR, data: infectedData });
    }
    return stats;
}

async function covidStats(sourceCountries = [], estimateCountry = '', days) {
    return new Promise(async (resolve, reject) => {
        try {   
            let allData = await db.fetchTotalData(sourceCountries, estimateCountry);
            let stats = {
                IFREstimate: {},
                estimateFromSources: [],
            };

            if(sourceCountries.length > 0)
                stats.estimateFromSources = calculateSourceStats(allData.data, sourceCountries, estimateCountry, days);
            if(allData.IFR.length > 0)
                stats.IFREstimate = calculateIFRStats(allData.data, allData.IFR, estimateCountry, days);
            resolve(stats);    
        } catch (error) {
            reject(error);
        }
        
    });
};

module.exports.covidStats = covidStats;