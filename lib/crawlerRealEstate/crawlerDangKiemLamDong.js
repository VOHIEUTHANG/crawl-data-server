const request = require("request");
const cheerio = require("cheerio");
const moment = require("moment");

const URL = "http://dangky.dangkiemlamdong.org.vn";
const ROUTE = "/Lib.aspx/Load_Danhsach_DK";

async function getHtmlPage(URL, payload, method = "GET") {
  return new Promise(async (resolve, reject) => {
    const options = {
      url: URL,
      headers: { "content-type": "application/json" },
      method: method,
      body: payload,
      json: true,
    };
    request(options, (err, response, html) => {
      if (err) {
        common.addLog("Request Error in request " + err);
        return resolve(undefined);
      }
      return resolve(html ? html : undefined);
    });
  });
}

async function getScheduleList() {
  const pageHtml = await getHtmlPage(URL);
  const $ = cheerio.load(pageHtml);
  const radioListData = $("p.P_Control_DK label")
    .contents()
    .map((index, node) => node.data)
    .toArray();

  const scheduleList = radioListData.filter((radioValue) =>
    moment(radioValue, "DD/MM/YYYY").isValid()
  );

  return scheduleList;
}

async function getDetailSchedule(location, dateSchedule) {
  const response = await getHtmlPage(
    URL + ROUTE,
    { Ngay: dateSchedule, Diadiem: location },
    "POST"
  );
  const pageHtml = response && response.d;
  const $ = cheerio.load(pageHtml);
  const emptySchedule = [];

  const tableRow = $(".Table_DK tr");
  const data = tableRow
    .map((index, item) => {
      const time = $(item).find("td.Tabel_DK_TD_2 > a").text();
      const status = $(item).find("td.Tabel_DK_TD_4 > a").text();
      const scheduleTime = { time, status };
      return scheduleTime;
    })
    .toArray()
    .filter((scheduleTime) => scheduleTime.time);
  return data;
}

module.exports = {
  getHtmlPage,
  getScheduleList,
  getDetailSchedule,
};
