## Covid Stats
- This service is accessible at [https://covid-5pocszgd4q-lz.a.run.app/](https://covid-5pocszgd4q-lz.a.run.app/)
- This service calculates the CFR of the source countries and applies the calculated CFR to the estimate country. It also calculates cases of the estimate country with an average IFR stored in the database. It accepts two query parameters `source` and `estimate`. Example: [https://covid-5pocszgd4q-lz.a.run.app/?estimate=sweden&source=korea-south,germany](https://covid-5pocszgd4q-lz.a.run.app/?estimate=sweden&source=korea-south)
- To try new countries use the endpoint: [https://api.covid19api.com/countries](https://api.covid19api.com/countries) The Slug property is to be used with our service.
- This service also serves the frontend.
- We use Docker to containerize the application. Please see the Dockerfile.
- We use cloud build to automatically deploy this code from the master branch to cloud run.
![CloudBuild](https://i.ibb.co/sQmmzMZ/covid-cicd.png)

## Instructions to run
- Clone this repo
- run the command `npm install`
- Next, run `npm start`
- Access the site at `localhost:3000`