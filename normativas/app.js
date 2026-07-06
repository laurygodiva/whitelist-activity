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

const loadingHint = document.getElementById("loadingHint");
let loadWatchdog = null;

function clearWatchdog() {
    if (loadWatchdog) {
        clearTimeout(loadWatchdog);
        loadWatchdog = null;
    }
}

document.querySelectorAll(".card").forEach(card => {

    card.addEventListener("click", () => {

        const book = card.dataset.book;

        if (!books[book]) return;

        menu.style.opacity = "0";

        setTimeout(() => {

            menu.style.display = "none";

            loading.classList.add("show");
            if (loadingHint) loadingHint.textContent = "";

            viewer.style.display = "block";
            viewer.style.opacity = "1";

            iframe.style.opacity = "0";
            iframe.src = books[book];

            // Si en 15s no llega ni "load" ni el mensaje de la normativa,
            // avisamos en vez de dejar el spinner girando para siempre.
            clearWatchdog();
            loadWatchdog = setTimeout(() => {
                if (loadingHint) {
                    loadingHint.textContent =
                        "Esto está tardando más de lo normal. Puede que el recurso externo no haya cargado. Vuelve atrás e inténtalo de nuevo.";
                }
            }, 15000);

        }, 250);

    });

});

iframe.addEventListener("load", () => {

    console.log("IFRAME LOAD");

    // El "load" del iframe solo confirma que el HTML del flipbook cargó,
    // no que el PDF ya se haya renderizado, así que no quitamos aún
    // la pantalla de carga aquí: esperamos al "flipbook-ready".

});

// El propio flipbook avisa con postMessage cuando ya renderizó la primera página
window.addEventListener("message", (event) => {
    if (event.data === "flipbook-ready") {
        clearWatchdog();
        loading.classList.remove("show");
        iframe.style.opacity = "1";
    }
});

back.addEventListener("click", () => {

    clearWatchdog();
    viewer.style.opacity = "0";

    setTimeout(() => {

        iframe.src = "";

        viewer.style.display = "none";

        loading.classList.remove("show");

        menu.style.display = "flex";
        menu.style.opacity = "1";

    }, 250);

});
