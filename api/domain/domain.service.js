const fs = require("fs");
const axios = require("axios");
var domains = require("../../data/cache-domains.json");
var reg = new RegExp("[^a-z0-9-.]", "i");
const PAGE_SIZE = 8;

async function getDomainInfo(name, filterBy, sortBy) {
  try {
    let domain = null;
    //Get domain from cache
    domain = _getDomainFromCache(name);
    if (domain) {
      domain.parseTime = "cached";
    } else {
      //Get domain from 3rd party
      domain = await _getDomainByName(name);
      domains.unshift(domain);
      _saveDomainToFile();
    }
    //Organize the domain for display
    domain.numOfAds = domain.allAds.length;
    domain.maxItemsInPage = PAGE_SIZE;
    let domainToDisplay = { ...domain };
    domainToDisplay = _getSortedDomain(domainToDisplay, sortBy);
    domainToDisplay.adsToDisplay = _getFilteredDomain(domain, filterBy);
    return domainToDisplay;
  } catch (err) {
    throw err;
  }
}

function _getFilteredDomain(domain, filterBy) {
  let filteredAds = [];
  const startIdx = PAGE_SIZE * (filterBy.currPage - 1);
  //Ads paging
  filteredAds = domain.allAds.slice(startIdx, startIdx + PAGE_SIZE);
  if (filterBy.title) {
    filteredAds = domain.allAds.filter((ad) => {
      return ad.name.toLowerCase().includes(filterBy.title.toLowerCase());
    });
  }
  return filteredAds;
}

//Sort the ads
function _getSortedDomain(domain, sortBy) {
  domain.allAds.sort((ad1, ad2) => {
    if (sortBy.type === "count") return (ad2.count - ad1.count) * sortBy.order;
    const name1 = ad1.name.toLowerCase();
    const name2 = ad2.name.toLowerCase();
    if (name1 > name2) return 1 * sortBy.order;
    if (name1 < name2) return -1 * sortBy.order;
    return 0;
  });
  return domain;
}

//Get domain from 3rd party
async function _getDomainByName(name) {
  try {
    const data = await _readFile(name);
    if (!data) {
      const domainToAdd = { name, adsToDisplay: [], allAds: [] };
      return domainToAdd;
    }
    const lines = await _splitToLines(data);
    const mapObject = await _convertToObject(lines);
    const domainAds = await _getDomainAds(mapObject);
    const domainToAdd = { name, allAds: domainAds };
    return domainToAdd;
  } catch (err) {
    throw err;
  }
}

//Get info with axios
async function _readFile(name) {
  try {
    const URL = `https://www.${name}/ads.txt`;
    const res = await axios.get(URL);
    return res.data;
  } catch (err) {
  }
}

function _splitToLines(data) {
  const lines = data.toString().replace(/\r\n/g, "\n").split("\n");
  return lines;
}

//Get object map of ads
function _convertToObject(lines) {
  const mapObject = {};
  for (let line of lines) {
    const wordsInLine = line.split(",");
    const firstWord = wordsInLine[0].toLowerCase();
    if (_isDomain(firstWord)) {
      mapObject[firstWord] = mapObject[firstWord]
        ? mapObject[firstWord] + 1
        : 1;
    }
  }
  return mapObject;
}

function _isDomain(domainName) {
  return !reg.test(domainName) && domainName.includes(".");
}

function _getDomainAds(mapObject) {
  const domainAds = [];
  for (const domainName in mapObject) {
    domainAds.push({
      _id: _makeId(),
      name: domainName,
      count: mapObject[domainName],
    });
  }
  return domainAds;
}

function _getDomainFromCache(name) {
  const domain = domains.find((currDomain) => currDomain.name === name);
  return domain;
}

function _saveDomainToFile() {
  return new Promise((resolve, reject) => {
    fs.writeFile(
      "data/cache-domains.json",
      JSON.stringify(domains, null, 2),
      (err) => {
        if (err) {
          reject("Cannot write to file");
        } else {
          resolve();
        }
      }
    );
  });
}

function _makeId(length = 5) {
  var txt = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++) {
    txt += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return txt;
}

module.exports = {
  getDomainInfo,
};
