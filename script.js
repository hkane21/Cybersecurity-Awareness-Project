function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
}

function injectHTML(list) {
  console.log('fired injectHTML');
  const target = document.querySelector('#breach_list');
  target.innerHTML = '';
  list.forEach((item) => {
    const str = `<li>${item.Name.bold()}: ${item.Description}</li>`;
    target.innerHTML += str;
  });
}

function filterList(list, query) {
  return list.filter((item) => {
    const LCaseName = item.Name.toLowerCase();
    const LCaseQuery = query.toLowerCase();
    return LCaseName.includes(LCaseQuery);
  })
}

function processRestaurants(list) {
  console.log('fired list of breaches');
  const range = [...Array(20).keys()];
  return newArray = range.map((item) => {
    const index = getRandomIntInclusive(0, list.length - 1);
    return list[index]
  });
}

function initChart(chart, object){
  const labels = Object.keys(object);
  const info = labels.map((item) => object[item][0].PwnCount);


  return new Chart(chart, {
    type: 'bar',
    data: {
      axis: 'y',
      labels: labels,
      datasets: [{
        label: 'Number of Users affected',
        backgroundColor: 'rgb(255, 99, 132)',
        borderColor: 'rgb(255, 99, 132)',
        data: info
      }]
    },
    options: {
      indexAxis: 'y',
    }
  });

}

function changeChart(chart, object){
  const labels = Object.keys(object);
  const info = labels.map((item) => object[item][0].PwnCount);

  chart.data.labels = labels;
  chart.data.datasets.forEach((dataset) => {
      dataset.data = info;
      return dataset;
  });
  chart.update();
}

async function getData(){
  const url ='https://haveibeenpwned.com/api/v3/breaches';
  const data = await fetch(url);
  const json = await data.json();
  const reply = json.filter((item) => Boolean(item.IsVerified)).filter((item) => Boolean(item.Name));
  return reply;
}

function shapeDataForChart(array){
  return array.reduce((collection, breach) => {
    if (!collection[breach.Name]) {
      collection[breach.Name] = [breach];
    }else{
    collection[breach.Name].push(breach);
    }
    return collection;
  }, {});

}

function sortDataByPwnCount(data, sortDirection) {
  return data.sort((a, b) => {
    if (sortDirection === 'asc') {
      return a.PwnCount - b.PwnCount;
    } else {
      return b.PwnCount - a.PwnCount;
    }
  });
}

function BreachTime(breaches) {
  const sortedBreaches = [...breaches].sort((a, b) => new Date(b.BreachDate) - new Date(a.BreachDate));
  const mostRecentBreach = sortedBreaches[0];
  const oldestBreach = sortedBreaches[sortedBreaches.length - 1];
  return {
    mostRecent: mostRecentBreach,
    oldest: oldestBreach
  };
}

async function mainEvent() {
  // const filterButton = document.querySelector('#filter_button');// Add a querySelector that targets your filter button here
  const loadDataButton = document.querySelector('#data_load');// Add a querySelector that targets your load county data button here
  const clearDataButton = document.querySelector('#data_clear');// Add a querySelector that clears your load county data button here
  const generateListButton = document.querySelector('#generate');// Add a querySelector that targets your generate button here
  const chartTarget = document.querySelector('#myChart');
  const loadAnimation = document.querySelector('#load_animation');
  loadAnimation.style.display = 'none';
  generateListButton.classList.add('hidden');
  const textField = document.querySelector('#breach');
  const sortDropdown = document.querySelector('#sort-breaches');

  // const carto = initMap();

  const chartData = await getData();
  const shapedData = shapeDataForChart(chartData);
  console.log(shapedData);
  const myChart = initChart(chartTarget, shapedData);

  const storedData = localStorage.getItem('storedData');
  let parsedData = JSON.parse(storedData);
  if (parsedData?.length > 0) {
    generateListButton.classList.remove('hidden');
  }

  let currentList = []; // this is "scoped" to the main event function
  let storedList2 = [];

  loadDataButton.addEventListener('click', async (submitEvent) => { 

    submitEvent.preventDefault();
    // this is substituting for a "breakpoint" - it prints to the browser to tell us we successfully submitted the form
    console.log('loading data...');
    loadAnimation.style.display = 'inline-block';
    // Basic GET request - this replaces the form Action
    const results = await fetch('https://haveibeenpwned.com/api/v3/breaches');


    const storedList = await results.json();
    const verifiedBreaches = storedList.filter(breach => breach.IsVerified);
    storedList2 = verifiedBreaches;
    localStorage.setItem('storedData',JSON.stringify(storedList2));
    parsedData = storedList2;
    if (parsedData?.length>0){
      generateListButton.classList.remove("hidden");
    }
    loadAnimation.style.display = 'none';
    console.table(storedList2);
    injectHTML(storedList2);
    const localData = shapeDataForChart(storedList2);
    changeChart(myChart, localData);

  });

  generateListButton.addEventListener('click', (event) => {
    console.log('generate new list');
    currentList = processRestaurants(chartData);
    console.log(currentList);
    injectHTML(currentList);
    const localData = shapeDataForChart(currentList);
    changeChart(myChart, localData);
  });

  let sortedData = sortDataByPwnCount(chartData, 'desc');
  sortDropdown.addEventListener('change', (event) => {
    let sortOrder = event.target.value;
    console.log(sortOrder);
    sortedData = sortDataByPwnCount(chartData, sortOrder);
    changeChart(myChart, sortedData);
  });

  textField.addEventListener('input', (event) => {
    console.log('input', event.target.value);
    const newList = filterList(currentList, event.target.value);
    console.log(newList);
    injectHTML(newList);
    const localData = shapeDataForChart(newList);
    changeChart(myChart, localData);
  });

  clearDataButton.addEventListener('click', (event)=>{
    console.log('clear browser data');
    localStorage.clear();
    console.log('localStorage Check', localStorage.getItem("storedData"));
  });


}

/*
  This adds an event listener that fires our main event only once our page elements have loaded
  The use of the async keyword means we can "await" events before continuing in our scripts
  In this case, we load some data when the form has submitted
*/
document.addEventListener('DOMContentLoaded', async () => mainEvent()); // the async keyword means we can make API requests
