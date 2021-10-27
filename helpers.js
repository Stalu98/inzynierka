exports.getLeagueName = (league) => {
    const leagueNames = {
        bundesliga: "Bundesliga",
        laliga: "LaLiga",
        ligue1: "Ligue1",
        premierleague: "Premier League",
        seriea: "Serie A"
    };

    return leagueNames[league];
};

