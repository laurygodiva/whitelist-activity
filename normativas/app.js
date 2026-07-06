const menu = document.getElementById("menu");
const viewer = document.getElementById("viewer");
const iframe = document.getElementById("flipbook");
const back = document.getElementById("back");
const loading = document.getElementById("loadingScreen");

const books = {
    general: "flipbooks/general/index.html",
    leo: "flipbooks/leo/index.html",
    comercios: "flipbooks/comercios/index.html",
    gobierno: "flipbooks/gobierno/index.html",
    ilegales: "flipbooks/ilegales/index.html",
    ems: "flipbooks/ems/index.html",
    staff: "flipbooks/staff/index.html",
    streamers: "flipbooks/streamers/index.html",
    playmaker: "flipbooks/playmaker/index.html"
};

document.querySelectorAll(".card").forEach(card => {

    card.addEventListener("click", () => {

        const book = card.dataset.book;

        if (!books[book]) return;

        menu.style.opacity = "0";

        setTimeout(() => {

            menu.style.display = "none";

            loading.classList.add("show");

            viewer.style.display = "block";
            viewer.style.opacity = "1";

            iframe.style.opacity = "0";
            iframe.src = books[book];

        }, 250);

    });

});

iframe.addEventListener("load", () => {

    console.log("IFRAME LOAD");

    loading.classList.remove("show");

    iframe.style.opacity = "1";

});

back.addEventListener("click", () => {

    viewer.style.opacity = "0";

    setTimeout(() => {

        iframe.src = "";

        viewer.style.display = "none";

        loading.classList.remove("show");

        menu.style.display = "flex";
        menu.style.opacity = "1";

    }, 250);

});