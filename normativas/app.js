const menu = document.getElementById("menu");
const viewer = document.getElementById("viewer");
const iframe = document.getElementById("flipbook");
const back = document.getElementById("back");

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

        iframe.src = books[book];

        menu.style.opacity = "0";

        setTimeout(() => {

            menu.style.display = "none";

            viewer.style.display = "block";

            requestAnimationFrame(() => {

                viewer.style.opacity = "1";

            });

        }, 250);

    });

});

back.addEventListener("click", () => {

    viewer.style.opacity = "0";

    setTimeout(() => {

        iframe.src = "";

        viewer.style.display = "none";

        menu.style.display = "flex";

        requestAnimationFrame(() => {

            menu.style.opacity = "1";

        });

    }, 250);

});
