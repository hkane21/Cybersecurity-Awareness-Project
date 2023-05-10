function displayBreaches() {
    const breachesList = document.querySelector('#breaches-list');
  
    // Make API request to get breaches data
    fetch('https://haveibeenpwned.com/api/v3/breaches')
      .then(response => response.json())
      .then(data => {
        // Loop through data and create a list item for each breach
        const list = document.createElement('ol');
        data.forEach(breach => {
          const listItem = document.createElement('li');
          listItem.innerText = `${breach.Name} occured: ${breach.BreachDate}`;
          list.appendChild(listItem);
        });
  
        // Append the list to the breaches div
        breachesList.appendChild(list);
      })
      .catch(error => console.error(error));
  }
  displayBreaches();
  