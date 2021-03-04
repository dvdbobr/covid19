const proxy = 'https://api.codetabs.com/v1/proxy/?quest=';
const coutriesEndpoint = 'https://restcountries.herokuapp.com/api/v1';
const regionEndpoint = 'https://restcountries.herokuapp.com/api/v1/region/';
const covidStats = 'https://corona-api.com/countries';
const continents = document.querySelector('.continents');
const status = document.querySelector('.status');
let continentLabels = [];
let continentData = [];
let currentContinent = '';
let currentStatus = '';
//general get api function
async function getApiData(url) {
    let callApi = await fetch(url);
    let data = await callApi.json();
    return data;
}
//get all countries
async function getCountries() {
    let dataArr = await getApiData(`${proxy}${coutriesEndpoint}`);
    console.log(dataArr)
}
//getCountries()
//get object with name and continet of coutry 
async function getCountryByContinent(continent) {
    currentContinent = continent;
    let dataArr = await getApiData(`${proxy}${coutriesEndpoint}`);
    //console.log(dataArr)
    let countryByContinentArr = [];
    await Promise.all(
        dataArr.map(async (c) => {
            //console.log(c.region)
            if (c.region === continent) {
                countryByContinentArr.push({ name: c.name.common, continent: c.region, code: c.cca2 })
            }
            else if (continent == 'world') {
                countryByContinentArr.push({ name: c.name.common, continent: c.region, code: c.cca2 })
            }
        })
    )
    //console.log(countryByContinentArr)
    return countryByContinentArr;
    //continentLabels = await getCountryByContinent("Europe")
}
async function getDataOfCountryInContinent() {
    const countriesInContinent = await getCountryByContinent(currentContinent);//get name and code from current continenet
    const infoAboutCountries = await getCovidStatsOfAllCountries();//get the stats if the name is in the contintent
    console.log("this is countriesInContinent", countriesInContinent)
    //console.log("this is infoAboutCountries", infoAboutCountries)
    let infoAboutCountriesArr = [];
    countriesInContinent.map(country => {
        infoAboutCountries.forEach(countryInfo => {
            if (country.code == countryInfo.code)
                infoAboutCountriesArr.push(countryInfo);
        })
    });
    console.log("after filter", infoAboutCountriesArr)
    return infoAboutCountriesArr;
}
//getCountryCode()

async function getCovidStatsOfAllCountries() {
    let data = await getApiData(`${proxy}${covidStats}`);
    let dataArr = data.data
    //console.log(dataArr)
    let covidInfo = [];
    await Promise.all(
        dataArr.map(async (c) => {
            // if (c.name === currentContinent) {
            covidInfo.push({
                name: c.name, code: c.code, confirmed: c.latest_data.confirmed, deaths: c.latest_data.deaths,
                recovered: c.latest_data.recovered, critical: c.latest_data.critical
            })
            // }
        })
    )
    //console.log(covidInfo)
    return covidInfo;
}

continents.addEventListener('click', async (e) => {
    myChart.update();
    const countriesInContinent = await getCountryByContinent(e.target.classList[0]);
    //console.log(data)
    continentLabels = [];
    countriesInContinent.forEach(c => {
        continentLabels.push(c.name);
    })
    //console.log(continentLabels);
    myChart.data.labels = continentLabels;
    myChart.data.datasets.label = "Covid 19 recoverd";
    myChart.update();
});
status.addEventListener('click', async (e) => {
    console.log("current continent is:", currentContinent)
    const info = await getDataOfCountryInContinent();
    console.log("this is info", info)
    currentStatus = e.target.classList[0];
    continentData = [];
    info.forEach(country => {
        continentData.push(country[currentStatus])
    })
    console.log("info of ", e.target.classList[0], continentData);

    myChart.data.datasets[0].label = currentContinent + " " + e.target.classList[0];
    myChart.data.datasets[0].data = continentData;
    myChart.update();
});