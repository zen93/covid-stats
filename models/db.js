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
                console.log('Error getting documents: ' + err);
                reject(err);
            });            
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