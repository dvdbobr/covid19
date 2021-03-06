const proxy = 'https://api.codetabs.com/v1/proxy/?quest=';
const coutriesEndpoint = 'https://restcountries.herokuapp.com/api/v1';
const regionEndpoint = 'https://restcountries.herokuapp.com/api/v1/region/';
const covidStats = 'https://corona-api.com/countries';
const continents = document.querySelector('.continents');
const status = document.querySelector('.status');
const countries = document.querySelector('.countries');
const worldChart = document.querySelector('#bar');
const continentChart = document.querySelector('#myChart');
const spinner = document.querySelector('.spinner');
const buttons = document.querySelectorAll('button');
const countryStatsPopup = document.createElement('div');
//global variables
let currentChartData = {
    dataArr: [],
    labelArr: []
}
let sumOfDataType = {
    Asia: [],
    Europe: [],
    Africa: [],
    Americas: []
}
let continentLabels = [];
let continentData = [];
let currentContinent = 'world';
let currentStatus = 'confirmed';
//general get api function
async function getApiData(url) {
    let callApi = await fetch(url);
    let data = await callApi.json();
    return data;
}

//get object with name and continet of coutry 
async function getCountryByContinent(continent) {
    currentContinent = continent;
    let dataArr = await getApiData(`${proxy}${coutriesEndpoint}`);
    let countryByContinentArr = [];
    await Promise.all(
        dataArr.map(async (c) => {
            if (c.region != "") {
                if (c.region === continent) {
                    countryByContinentArr.push({ name: c.name.common, continent: c.region, code: c.cca2, region: c.region })
                }
            }

            if (continent == 'world') {
                countryByContinentArr.push({ name: c.name.common, continent: c.region, code: c.cca2, region: c.region })
            }
        })
    )

    return countryByContinentArr;
}
async function divideContinentArr() {
    sumOfDataType = {
        Asia: [],
        Europe: [],
        Africa: [],
        Americas: []
    }
    const countriesInContinent = await getCountryByContinent('world');//get name and code from current continenet
    const infoAboutCountries = await getCovidStatsOfAllCountries();
    countriesInContinent.map(country => {
        if (country.continent == "Asia") {
            infoAboutCountries.forEach(countryInfo => {
                if (country.code == countryInfo.code)
                    return sumOfDataType.Asia.push(countryInfo);
            })
        }
        else if (country.continent == "Europe") {
            infoAboutCountries.forEach(countryInfo => {
                if (country.code == countryInfo.code)
                    return sumOfDataType.Europe.push(countryInfo);
            })
        }
        else if (country.continent == "Africa") {
            infoAboutCountries.forEach(countryInfo => {
                if (country.code == countryInfo.code)
                    return sumOfDataType.Africa.push(countryInfo);
            })
        }
        else if (country.continent == "Americas") {
            infoAboutCountries.forEach(countryInfo => {
                if (country.code == countryInfo.code)
                    return sumOfDataType.Americas.push(countryInfo);
            })
        }
    })
}

//filter between country codes from both api's
async function getDataOfCountryInContinent() {
    const countriesInContinent = await getCountryByContinent(currentContinent);//get name and code from current continenet
    const infoAboutCountries = await getCovidStatsOfAllCountries();//get the stats if the name is in the contintent
    let infoAboutCountriesArr = [];
    if (currentContinent == 'world') {
        infoAboutCountries.forEach(countryInfo => {
            infoAboutCountriesArr.push(countryInfo);
        })
    }
    else {
        countriesInContinent.map(country => {
            if (country.code != "HM" && country.code != "TF" && country.code != "BV" && country.code != "AQ") {
                infoAboutCountries.forEach(countryInfo => {
                    if (country.code == countryInfo.code)
                        infoAboutCountriesArr.push(countryInfo);
                })
            }
        });
    }
    return infoAboutCountriesArr;
}
//get stats of all countries and put them into object with relevant data
async function getCovidStatsOfAllCountries() {
    let data = await getApiData(`${proxy}${covidStats}`);
    let dataArr = data.data
    let covidInfo = [];
    await Promise.all(
        dataArr.map(async (c) => {
            covidInfo.push({
                name: c.name, code: c.code, confirmed: c.latest_data.confirmed, deaths: c.latest_data.deaths,
                recovered: c.latest_data.recovered, critical: c.latest_data.critical
            })
        })
    )
    return covidInfo;
}

//stats for the popup after choosing a country from drop down list
async function getStatsByCountryCode(code) {
    let data = await getApiData(`${proxy}${covidStats}/${code}`);
    let countryData = data.data;
    if (countryData.timeline.length != 0) {
        let stats = {
            totalCases: countryData.latest_data.confirmed, newCases: countryData.timeline[0].new_confirmed,
            totalDeaths: countryData.latest_data.deaths, newDeaths: countryData.timeline[0].new_deaths,
            totalRecovered: countryData.latest_data.recovered, critical: countryData.latest_data.critical
        }
        return stats
    }
    else {
        let stats = {
            totalCases: countryData.latest_data.confirmed, newCases: "unknown",
            totalDeaths: countryData.latest_data.deaths, newDeaths: "unknown",
            totalRecovered: countryData.latest_data.recovered, critical: countryData.latest_data.critical
        }
        return stats
    }
}
//gets type of specific data of the chosen continent
async function getContinentData(type) {
    const info = await getDataOfCountryInContinent();
    continentData = [];
    info.forEach(country => {
        if (country.region != "") {
            continentData.push(country[type])
        }
    })
    currentChartData.dataArr = continentData;
    myChart.data.datasets[0].data = currentChartData.dataArr;
}
//create ddl of countries to chose from
async function createDDL() {
    const countriesInContinent = await getCountryByContinent(currentContinent);
    countriesInContinent.forEach(country => {//make labels and countries for drop down
        if (country.name != "Kosovo" && country.name != "Svalbard and Jan Mayen") {
            continentLabels.push(country.name);
            let option = document.createElement('option');
            option.setAttribute("code", country.code);
            option.textContent = country.name;
            countries.appendChild(option)
        }
    })
}
//checks which continent was clicked
continents.addEventListener('click', async (e) => {
    spinner.classList.remove('hidden');
    buttons.disabled = true;
    countries.innerHTML = '';
    const countriesInContinent = await getCountryByContinent(e.target.classList[0]);
    continentLabels = [];
    countries.innerHTML = '<option selected disabled>Choose A Country</option>'
    if (currentContinent != 'world') {
        continentChart.style.display = "block";
        worldChart.style.display = "none";
        await createDDL()
        await getContinentData(currentStatus);
        currentChartData.labelArr = continentLabels;
        myChart.data.labels = continentLabels;
        myChart.data.datasets[0].data = currentChartData.dataArr;
    }
    else {
        await createDDL()
        continentChart.style.display = "none";
        worldChart.style.display = "block";
        currentChartData.labelArr = ["Asia", "Europe", "Africa", "Americas"];
        currentChartData.dataArr =
            [await countStatType("Asia", currentStatus),
            await countStatType("Europe", currentStatus),
            await countStatType("Africa", currentStatus),
            await countStatType("Americas", currentStatus)];
        bar.data.datasets[0].data = currentChartData.dataArr;
    }
    spinner.classList.add('hidden');
    buttons.disabled = false;
    myChart.data.datasets[0].label = currentStatus + " in " + currentContinent;
    myChart.data.datasets[0].backgroundColor = getColor();
    bar.data.datasets[0].label = currentStatus + " in " + currentContinent;
    bar.data.datasets[0].backgroundColor =
        [
            getColor(),
            getColor(),
            getColor(),
            getColor(),
        ]
    myChart.update();
    bar.update();
});

//change status of chart
status.addEventListener('click', async (e) => {
    spinner.classList.remove('hidden');
    buttons.disabled = true;
    const info = await getDataOfCountryInContinent();
    currentStatus = e.target.classList[0];
    if (currentContinent != 'world') {
        await getContinentData(currentStatus);
        myChart.update();
    }
    else {
        currentChartData.labelArr = ["Asia", "Europe", "Africa", "Americas"];
        currentChartData.dataArr =
            [await countStatType("Asia", currentStatus),
            await countStatType("Europe", currentStatus),
            await countStatType("Africa", currentStatus),
            await countStatType("Americas", currentStatus)];
        bar.data.datasets[0].data = currentChartData.dataArr;
    }
    spinner.classList.add('hidden');
    buttons.disabled = false;
    myChart.data.datasets[0].backgroundColor = getColor();
    myChart.data.datasets[0].label = currentStatus + " in " + currentContinent;
    bar.data.datasets[0].label = currentStatus + " in " + currentContinent;
    bar.data.datasets[0].backgroundColor =
        [
            getColor(),
            getColor(),
            getColor(),
            getColor(),
        ];
    myChart.update();
    bar.update();
});
countryStatsPopup.classList.add('countryStatsDiv');
countries.addEventListener('change', async (e) => {
    countryStatsPopup.innerHTML = '';
    countryStatsPopup.style.visibility = "visible";
    let chosenCountry = countries.options[countries.selectedIndex].getAttribute('code');
    let countryStats = await getStatsByCountryCode(chosenCountry);
    countryStatsPopup.innerHTML = `
    <div class="countryStats-content">
    <span class="close">&times;</span>
    <div class="countryStats-header">
    <h1>${countries.options[countries.selectedIndex].textContent}</h2>
    </div>
    <hr/>
    <div class="stat-row">
    <h4>Total Cases: 
      <p>${countryStats.totalCases}</p>
    </h4>
    <h4>New Cases: 
      <p>${countryStats.newCases}</p>
    </h4>
    <h4>Total Deaths: 
    <p>${countryStats.totalDeaths}</p>
    </h4>
    <h4>New Deaths: 
      <p>${countryStats.newDeaths}</p>
    </h4>
    <h4>Total Recovered: 
      <p>${countryStats.totalRecovered}</p>
    </h4>
    <h4>Total Critical Cases: 
    <p>${countryStats.critical}</p>
    </h4>
  </div>`
    document.body.appendChild(countryStatsPopup);
    const closeStats = document.querySelector('.close');
    closeStats.addEventListener('click', () => {
        countryStatsPopup.style.visibility = "hidden";
    })
})
async function init() {
    spinner.classList.remove('hidden')
    buttons.disabled = true;
    const countriesInContinent = await getCountryByContinent("world");
    countries.innerHTML = '<option selected disabled>Choose A Country</option>'
    countriesInContinent.forEach(country => {
        continentLabels.push(country.name);
        let option = document.createElement('option');
        option.setAttribute("code", country.code);
        option.textContent = country.name;
        countries.appendChild(option)
    })
    currentChartData.labelArr = ["Asia", "Europe", "Africa", "Americas"];
    currentChartData.dataArr =
        [await countStatType("Asia", "confirmed"),
        await countStatType("Europe", "confirmed"),
        await countStatType("Africa", "confirmed"),
        await countStatType("Americas", "confirmed")];
    spinner.classList.add('hidden')
    buttons.disabled = false;
    bar.data.labels = currentChartData.labelArr
    bar.data.datasets[0].data = currentChartData.dataArr;
    bar.update()
}
//sum of continent by type of stat
async function countStatType(continent, dataType) {
    let sum = 0;
    await divideContinentArr()
    sumOfDataType[continent].map((c) => {
        if (dataType == "confirmed")
            sum += c.confirmed;
        else if (dataType == "deaths")
            sum += c.deaths
        else if (dataType == "recovered")
            sum += c.recovered
        else if (dataType == "critical")
            sum += c.critical
    })
    return sum;
}
