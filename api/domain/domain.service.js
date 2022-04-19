const fs = require("fs");
const axios = require("axios");
var domains = require("../../data/domain-cache.json");

async function query(name, filterBy, sortBy) {
  try {
    let domain = null;
    domain = _getDomainFromCache(name);
    if (domain) console.log("FROM CACHE");
    else {
      domain = await _getDomainByName(name);
      domains.unshift(domain);
      _saveDomainToFile();
      console.log("FROM FETCH");
    }
    let domainToDisplay = { ...domain };
    if (filterBy) domainToDisplay.ads = _getFilteredDomain(domain, filterBy);
    domainToDisplay = _getSortedDomain(domainToDisplay, sortBy);

    return domainToDisplay;
  } catch (err) {
    console.log("cannot find boards", err);
    throw err;
  }
}

function _getFilteredDomain(domain, filterBy) {
  const filteredAds = domain.ads.filter((ad) => {
    return ad.name.toLowerCase().includes(filterBy.title.toLowerCase());
  });
  return filteredAds;
}

function _getSortedDomain(domain, sortBy) {
  domain.ads.sort((ad1, ad2) => {
    if (sortBy.type === "count") return (ad2.count - ad1.count) * sortBy.order;
    const name1 = ad1.name.toLowerCase();
    const name2 = ad2.name.toLowerCase();
    return 1;
  });
  return domain;
}

async function _getDomainByName(name) {
  try {
    const data = await _readFile(name);
    if (!data) {
      console.log("DATA NOT FOUND");
      const domainToAdd = { name, ads: [] };
      return domainToAdd;
    }
    const lines = await _splitToLines(data);
    const mapObject = await _convertToObject(lines);
    const domainAds = await _getDomainAds(mapObject);
    const domainToAdd = { name, ads: domainAds };
    return domainToAdd;
  } catch (err) {
    throw err;
  }
}

async function _readFile(name) {
  try {
    const URL = `https://www.${name}/ads.txt`;
    const res = await axios.get(URL);
    return res.data;
  } catch (err) {
    console.log(err);
  }
}

// async function _readFile() {
//   try {
//     const data = await fs.promises.readFile("data/data.txt", "utf8");
//     return data;
//   } catch (err) {
//     console.log(err);
//   }
// }

function _splitToLines(data) {
  const lines = data.toString().replace(/\r\n/g, "\n").split("\n");
  return lines;
}

function _convertToObject(lines) {
  const mapObject = {};
  for (let line of lines) {
    const wordsInLine = line.split(" ");
    const firstWord = wordsInLine[0].substring(0, wordsInLine[0].length - 1);
    if (firstWord.includes(".")) {
      mapObject[firstWord] = mapObject[firstWord]
        ? mapObject[firstWord] + 1
        : 1;
    }
  }
  return mapObject;
}

function _getDomainAds(mapObject) {
  domainAds = [];
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

function _addDomainToCache(domainToAdd) {
  domains.unshift(domainToAdd);
  _saveDomainToFile();
}

function _saveDomainToFile() {
  return new Promise((resolve, reject) => {
    fs.writeFile(
      "data/domain-cache.json",
      JSON.stringify(domains, null, 2),
      (err) => {
        if (err) {
          console.log(err);
          reject("Cannot write to file");
        } else {
          console.log("Wrote Successfully!");
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
  query,
};
