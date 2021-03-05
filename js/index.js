const proxy = 'https://api.codetabs.com/v1/proxy/?quest=';
const coutriesEndpoint = 'https://restcountries.herokuapp.com/api/v1';
const regionEndpoint = 'https://restcountries.herokuapp.com/api/v1/region/';
const covidStats = 'https://corona-api.com/countries';
const continents = document.querySelector('.continents');
const status = document.querySelector('.status');
const countries = document.querySelector('.countries');
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
    // dataArr.forEach(e => {
    //     if (e.name.common == undefined || e.cca2 == undefined)
    //         console.log(e)
    // })
    console.log("countries:", dataArr)
}
getCountries()
//get object with name and continet of coutry 
async function getCountryByContinent(continent) {
    currentContinent = continent;
    let dataArr = await getApiData(`${proxy}${coutriesEndpoint}`);
    //console.log(dataArr)
    let countryByContinentArr = [];
    await Promise.all(
        dataArr.map(async (c) => {
            if (c.region != "") {
                //console.log(c.region)
                if (c.region === continent) {
                    countryByContinentArr.push({ name: c.name.common, continent: c.region, code: c.cca2, region: c.region })
                }
                else if (continent == 'world') {
                    countryByContinentArr.push({ name: c.name.common, continent: c.region, code: c.cca2, region: c.region })
                }
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
    let infoAboutCountriesArr = [];
    console.log("this is infoAboutCountries", infoAboutCountries)

    if (currentContinent == 'world') {
        infoAboutCountries.forEach(countryInfo => {
            if (countryInfo.code != "HM" && countryInfo.code != "TF" && countryInfo.code != "BV" && countryInfo.code != "AQ")
                infoAboutCountriesArr.push(countryInfo);
        })
    }
    else {
        countriesInContinent.map(country => {
            if (country.code != "HM" && country.code != "TF" && country.code != "BV" && country.code != "AQ") {
                infoAboutCountries.forEach(countryInfo => {
                    if (country.code == countryInfo.code)
                        infoAboutCountriesArr.push(countryInfo);
                    // else if (currentContinent == 'world')
                    //     infoAboutCountriesArr.push(countryInfo);

                })
            }
        });
    }
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
            // createCountryData(c)
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

async function getSpecificStatus(stat) {

}
async function getStatsByCountryCode(code) {
    let data = await getApiData(`${proxy}${covidStats}/${code}`);
    let countryData = data.data;
    let stats = {
        totalCases: countryData.latest_data.confirmed, newCases: countryData.timeline[0].new_confirmed,
        totalDeaths: countryData.latest_data.deaths, newDeaths: countryData.timeline[0].new_deaths,
        totalRecovered: countryData.latest_data.recovered, critical: countryData.latest_data.critical
    }
    console.log("code",countryData.code,"this is", countryData.name, "stats", stats);
    return stats
}

continents.addEventListener('click', async (e) => {
    countries.innerHTML = '';
    const countriesInContinent = await getCountryByContinent(e.target.classList[0]);
    console.log(countriesInContinent)
    continentLabels = [];

    countriesInContinent.forEach(country => {
        if (country.name != "Kosovo" && country.name != "Svalbard and Jan Mayen") {//country.name != "Kosovo" && country.name != "Svalbard and Jan Mayen" && 
            continentLabels.push(country.name);
            let span = document.createElement('span');
            span.setAttribute("code", country.code);
            span.textContent = country.name;
            countries.appendChild(span)
        }
    })
    //console.log(continentLabels);
    myChart.data.labels = continentLabels;
    if (currentStatus == '' && continentData != [])
        myChart.data.datasets[0].label = "Covid 19 recoverd";
    else {
        myChart.data.datasets[0].label = currentStatus + " in " + currentContinent;

    }
    myChart.update();
});
status.addEventListener('click', async (e) => {
    console.log("current continent is:", currentContinent)
    const info = await getDataOfCountryInContinent();
    console.log("this is info", info)
    currentStatus = e.target.classList[0];
    continentData = [];
    info.forEach(country => {
        if (country.region != "") {
            continentData.push(country[currentStatus])
        }
    })
    //console.log("info of ", e.target.classList[0], continentData);
    console.log("current status", currentStatus)
    myChart.data.datasets[0].label = currentStatus + " in " + currentContinent;
    myChart.data.datasets[0].data = continentData;
    myChart.update();
});
countries.addEventListener('click', async (e) => {
    let chosenCountry = e.target.getAttribute('code');
    let countryStats = await getStatsByCountryCode(chosenCountry)
})