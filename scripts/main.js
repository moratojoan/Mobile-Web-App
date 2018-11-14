var app = new Vue({
    el: "#app",
    data: {
        pageToShow: "index2"
    },
    methods: {
        showHidePages: function (id_pageToShow) {
            this.pageToShow = id_pageToShow;
        }
    }
})
