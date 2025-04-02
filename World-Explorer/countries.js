'use strict'
const countriesContainer = document.querySelector('.countries');
class countries {
    constructor(flag, name,region, pop, lan, currencies, className = ' ') {
        this.flag = flag;
        this.name = name;
        this.region = region;
        this.pop = pop;
        this.lan = lan;
        this.currencies = currencies;
        this.className = className;
    }
    renderCountry(){
        const html = `<article class="country ${this.className}">
          <img class="country__img" src="${this.flag}" />
          <div class="country__data">
            <h3 class="country__name">${this.name}</h3>
            <h4 class="country__region">${this.region}</h4>
            <p class="country__row"><span>👫</span>${(+this.population / 1000000).toFixed(1)}</p>
            <p class="country__row"><span>🗣️</span>${this.languages[0].name}</p>
            <p class="country__row"><span>💰</span>${this.currencies[0].name}</p>
          </div>
        </article>`;
        countriesContainer.innerHTML = ' ';
        countriesContainer.insertAdjacentHTML("beforeend", html);
    }

}
export default countries;