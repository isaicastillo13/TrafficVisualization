(() => {
    const App = {
        elements: {
            documentBody: document,
            arrivalInfoTable: document.querySelector(".information__table .table__body"),
            table: document.querySelector(".information__table"),
            summaryRow: null,
            rows: [], // Aquí guardaremos las referencias a las filas creadas
        },
        data: {
            destinations: [
                "Muxbal Entrada",
                "Trébol VH",
                "Pulté",
                "Obelisco",
                "El Trébol",
            ],
            apiKey:
                "pk.eyJ1IjoiaXNhaWNhc3RpbGxvIiwiYSI6ImNtMmVzZjJmZDAxbHgyanBuMmdrc2R6cnEifQ.jwWcYATscubGfZl-mrv3dA",
            coordinates: {
                startingPoint: "-90.45430417450005,14.54580867150378",
                destinations: [
                    "-90.46766270079755,14.565155765386553",
                    "-90.48279240044211,14.580189393942034",
                    "-90.44864509859013,14.590982283589563",
                ],
            },
            lastUpdated: null, // Almacena la fecha de la última llamada del API
        },
        init() {
            App.bindEvents();
        },
        bindEvents() {
            App.elements.documentBody.addEventListener("DOMContentLoaded",App.handlers.loadApiData);

            // Llama a la API cuando se inicia el programa y luego cada 5 minutos
            setInterval(App.handlers.loadApiData, 300000);

            // Actualiza la fecha atual cada segundo
            setInterval(App.methods.renderSummaryRow, 1000);
        },
        handlers: {
            loadApiData() {
                App.methods.fetchMapData();

                // Actualiza el tiempo de actualizacion de la api
                setInterval(App.methods.updateApiCall, 1000);
            },
        },
        methods: {
            async fetchMapData() {
                const { startingPoint, destinations } = App.data.coordinates;
                const url = `https://api.mapbox.com/directions-matrix/v1/mapbox/driving/${startingPoint};${destinations.join(";")}?sources=0&destinations=1;2;3&annotations=distance,duration&access_token=${App.data.apiKey}`;

                try {
                    const response = await fetch(url);
                    const data = await response.json();
                    App.data.lastUpdated = new Date(); // Almacenar el momento en que se llama a la API por primera vez
                    App.methods.processTravelTimes(data);
                } catch (error) {
                    console.error("Error fetching MapBox data: ", error);
                    setTimeout(App.methods.fetchMapData, 60000); // Reintenta después de 1 minuto en caso de error
                }
            },
            processTravelTimes(data) {
                const timesInSecond = data.durations[0];
                const distances = data.distances[0];

                timesInSecond.forEach((time, index) => {
                    const distanceInKm = (distances[index] / 1000).toFixed(1);
                    const timeInMinutes = Math.round(time / 60);
                    const rowClass = index % 2 === 0 ? "bg--blue" : "bg--blueNavy";

                    if (App.elements.rows[index]) {
                        // Si la fila ya existe, simplemente actualízala
                        App.methods.updateRow(index, timeInMinutes, distanceInKm);
                    } else {
                        // Si la fila no existe, créala
                        App.methods.renderRow(index, timeInMinutes, distanceInKm, rowClass);
                    }
                });

                // Actualiza la fila de resumen con la última fecha de actualización
                App.methods.renderSummaryRow();
            },
            renderRow(index, time, distance, className) {
                const tableBody = App.elements.arrivalInfoTable;
                const destination = App.data.destinations[index]; // No usamos shift para no alterar el array original

                const row = document.createElement("tr");
                row.classList.add(className);
                row.innerHTML = `
                    <td>${destination}</td>
                    <td>${distance} KM</td>
                    <td>${time} Min</td>
                `;

                tableBody.appendChild(row);
                App.elements.rows[index] = row; // Guarda la referencia de la fila
            },
            updateRow(index, time, distance) {
                const row = App.elements.rows[index];
                row.cells[1].textContent = `${distance} KM`;
                row.cells[2].textContent = `${time} Min`;
            },
            renderSummaryRow() {
                const fecha = new Date();
                const fechaFormateada = fecha.toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: true,
                });

                if (!App.elements.summaryRow) {
                    const table = App.elements.table;
                    const rowFinal = document.createElement("tr");
                    rowFinal.classList.add("p-small");
                    rowFinal.innerHTML = `
                        <td>${fechaFormateada}</td>
                        <td></td>
                        <td>Actualizado hace 0 min</td>
                    `;
                    table.appendChild(rowFinal);
                    App.elements.summaryRow = rowFinal; // Guarda la referencia
                } else {
                    // Si ya existe, solo actualiza la fecha
                    App.elements.summaryRow.cells[0].textContent = `${fechaFormateada}`;
                }
            },
            updateApiCall() {
                if (App.data.lastUpdated) {
                    const now = new Date();
                    const diffInMs = now - App.data.lastUpdated;
                    const diffInMinutes = Math.floor(diffInMs / 60000); // Diferencia en minutos
                    const diffInSeconds = Math.floor((diffInMs % 60000) / 1000); // Diferencia en segundos

                    if (diffInMinutes > 0) {
                        App.elements.summaryRow.cells[2].textContent = `Actualizado hace ${diffInMinutes} min`;
                    } else {
                        App.elements.summaryRow.cells[2].textContent = `Actualizado hace ${diffInSeconds} seg`;
                    }
                }
            },
        },
    };

    App.init();
})();
