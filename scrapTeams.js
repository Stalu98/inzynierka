const { Client } = require("pg");
const connectionString =
    "postgressql://postgres:postgres@localhost:5433/postgres";
const scraper = require("./scraper");
const puppeteer = require("puppeteer");

const client = new Client({
    connectionString: connectionString,
});

const season = "-2020-2021";
const headlessMode = true;

const leagues = [
    {
        name: "premierleague",
        url: `https://www.flashscore.pl/pilka-nozna/anglia/premier-league${season}/`,
    },
    {
        name: "bundesliga",
        url: `https://www.flashscore.pl/pilka-nozna/niemcy/bundesliga${season}/`,
    },
    {
        name: "seriea",
        url: `https://www.flashscore.pl/pilka-nozna/wlochy/serie-a${season}/`,
    },
    {
        name: "laliga",
        url: `https://www.flashscore.pl/pilka-nozna/hiszpania/laliga${season}/`,
    },
    {
        name: "ligue1",
        url: `https://www.flashscore.pl/pilka-nozna/francja/ligue-1${season}/`,
    },
];

(async () => {
    const browser = await puppeteer.launch({ headless: headlessMode });
    await client.connect();

    const teams = (
        await Promise.allSettled(
            leagues
                .map((league) => league.url + "tabela/")
                .map((url) => scraper.getTeamsDataFromLeague(url, browser))
        )
    )
        .filter((result) => result.status === "fulfilled")
        .map((result) => result.value);

    teams.forEach((team, index) => {
        team.forEach((stat) => {
            client.query(
                `INSERT INTO teams(name, points, position, league) VALUES($1, $2, $3, $4)`,
                [stat.name, stat.points, stat.position, leagues[index].name],
                (err, res) => {
                    console.log(err, res);
                }
            );
        });
    });
})();
