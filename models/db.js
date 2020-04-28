const Firestore = require('@google-cloud/firestore');

const db = new Firestore({
  projectId: 'wordpress-cloud-run',
  keyFilename: './keys/wordpress-cloud-run-owner-key.json',
});

function cleanNum(num) {
    return parseInt(num.trim().replace(',', ''));
}

function fetchData() {
    return new Promise((resolve, reject) => {
        let data = [];
        db.collection('countries').get()
            .then((snapshot) => {
                snapshot.forEach(doc => {
                    data.push({country: doc.id, cases: doc.data().cases, deaths: doc.data().deaths });
                });
                resolve(data);
            })
            .catch( err => {
                console.log('Error getting documents: ' + err.message);
                reject(err);
            });            
    });
}

async function fetchTotalData(sourceCountries, estimateCountry) {
    return new Promise(async (resolve, reject) => {
        try {
            let temp = { data: [], IFR: [] };
            //let data = [], IFR = [];
            if(!estimateCountry) reject({ message: "Must provide estimate country!" });
            let snapshot = await db.collection('countriesTotal').doc(estimateCountry).get();
            if(snapshot.data())
                temp.data.push(snapshot.data());

            if(sourceCountries.length > 0) {
                for(source of sourceCountries) {
                    snapshot = await db.collection('countriesTotal').doc(source).get();
                    if(snapshot.data())
                        temp.data.push(snapshot.data());
                }
            }            

            snapshot = await db.collection('IFR').get();

            snapshot.forEach(doc => {
                if(doc.data())
                    temp.IFR.push(doc.data());    
            });            
            resolve(temp);
        } catch (error) {
            reject(error);
        }
    });
}

async function saveData(data) {
    return new Promise(async (resolve, reject) => {
        try {
            for(let country of data) {
                let docRef = db.collection('countries').doc(country.country.trim().toLowerCase());
                let setStats = await docRef.set({
                    cases: cleanNum(country.cases),
                    deaths: cleanNum(country.deaths),
                });
            }
            resolve(true);
        } catch (error) {
            reject(error);
        }
    });
}

module.exports.fetchData = fetchData;
module.exports.saveData = saveData;
module.exports.fetchTotalData = fetchTotalData;