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

// To pobiera teamy i wsadza je do bazy.
(async () => {
    // to odpala bota
    const browser = await puppeteer.launch({ headless: headlessMode });
    // to łączy się z bazą
    await client.connect();

    // to pobiera teamy
    const teams = (
        await Promise.allSettled(
            leagues
                // to mapuje urle lig do podstron z tabelami
                .map((league) => league.url + "tabela/")
                // to wywołuje metode skrapera do skrapowania teamów
                .map((url) => scraper.getTeamsDataFromLeague(url, browser))
        )
    )
        .filter((result) => result.status === "fulfilled")
        .map((result) => result.value);

    // to wsadza dane każdego teamu do bazki
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
