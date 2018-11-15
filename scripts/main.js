var app = new Vue({
    el: "#app",
    data: {
        loading: false,
        pageToShow: "index2",
        url: "https://api.jsonbin.io/b/5bed66773c134f38b0195ba0/2",
        teams: null,
        matchdays: null,
        teamToShow: null,
        matchdaySelected: "matchday 4"
    },
    methods: {
        showHidePages: function (id_pageToShow, infoToShow) {
            console.log(infoToShow);
            if (infoToShow) {
                if (id_pageToShow == "teamInfo") {
                    this.teamToShow = infoToShow;
                }
            }

            this.pageToShow = id_pageToShow;
        },
        startFetch: function (url) {
            fetch(url, {
                    method: "GET"
                })
                .then(response => response.json())
                .then(myData => {
                    console.log(myData);
                    //Plain general data.
                    this.teams = myData.teams;
                    this.matchdays = myData.matchdays;
                    //Plain specific info to avoid errors the first time.
                    this.teamToShow = myData.teams[0];

                    this.loading = true;
                })
        }
    },
    created: function () {
        this.startFetch(this.url);
    },
    computed: {
        selectMatchday: function () {
            var day = parseInt(this.matchdaySelected.split(" ")[1]);
            var objMatchday = this.matchdays[day - 1];
            var matchdayToShow = [];
            //.push [obj match, obj teamLocal, obj teamVisitante]
            for (let i = 0; i < objMatchday.matches.length; i++) {
                var subarrayMatch = [objMatchday.matches[i]];
                for (let k = 0; k < this.teams.length; k++) {
                    if (this.teams[k].name == objMatchday.matches[i].localTeam.name) {
                        subarrayMatch.push(this.teams[k]);
                    }
                }
                for (let k = 0; k < this.teams.length; k++) {
                    if (this.teams[k].name == objMatchday.matches[i].visitingTeam.name) {
                        subarrayMatch.push(this.teams[k]);
                    }
                }
                matchdayToShow.push(subarrayMatch);
            }
            return matchdayToShow;
        }
    }
});
