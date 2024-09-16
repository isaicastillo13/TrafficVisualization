(() => {
    const App = {
        elements: {
            documentBody: document,
            arrivalInfoTable: document.querySelector('.information__table .table__body'),
            table: document.querySelector('.information__table')
        },
        data: {
            destinations: ["Trebol Vista Hermosa", "Zona Pradera", "Campo Marte", "Obelisco", "El Trébol"],
            apiKey: "pk.eyJ1IjoiaXNhaWNhc3RpbGxvIiwiYSI6ImNsd3o4Y2U4dTA0c2EyanB5a3JxaW0zeGwifQ.0vMwUPTDeeX5hU232bo2UQ",
            coordinates: {
                startingPoint: "-90.48274768383342,14.575241689499608",
                destinations: [
                    "-90.48255494006219,14.58062188262523",
                    "-90.49580300770202,14.581844067578363",
                    "-90.5172483177911,14.594560871806475" 
                ]
            }
        },
        init() {
            this.bindEvents();
        },
        bindEvents() {
            this.elements.documentBody.addEventListener('DOMContentLoaded', this.handlers.loadApiData);
        },
        handlers: {
            loadApiData() {
                App.methods.fetchWazeData();
            }
        },
        methods: {
            async fetchWazeData() {
                const { startingPoint, destinations } = App.data.coordinates;
                const url = `https://api.mapbox.com/directions-matrix/v1/mapbox/driving/${startingPoint};${destinations.join(';')}?sources=0&destinations=1;2;3&annotations=distance,duration&access_token=${App.data.apiKey}`;

                try {
                    const response = await fetch(url);
                    const data = await response.json();
                    App.methods.processTravelTimes(data);
                    console.log(data)
                } catch (error) {
                    console.error("Error fetching Waze data: ", error);
                    setTimeout(App.methods.fetchWazeData, 60000);
                }
            },
            processTravelTimes(data) {
                const timesInSecond = data.durations[0];
                const distances = data.distances[0];

                timesInSecond.forEach((time, index) => {
                    const distanceInKm = (distances[index] / 1000).toFixed(1);
                    const timeInMinutes = Math.round(time / 60);
                    const rowClass = index % 2 === 0 ? "bg--blue" : "bg--blueNavy";
                    App.methods.renderRow(timeInMinutes, distanceInKm, rowClass);
                });

                App.methods.renderSummaryRow();
            },
            renderRow(time, distance, className) {
                const tableBody = App.elements.arrivalInfoTable;
                const destination = App.data.destinations.shift();

                const row = document.createElement('tr');
                row.classList.add(className);
                row.innerHTML = `
                    <td>${destination}</td>
                    <td>${distance} KM</td>
                    <td>${time} Min</td>
                `;

                tableBody.appendChild(row);
            },
            renderSummaryRow() {
                const fecha = new Date();
                const fechaFormateada = fecha.toLocaleDateString('es-ES', {
                    day: '2-digit',    // Día con dos dígitos (e.g. 05)
                    month: '2-digit',  // Mes con dos dígitos (e.g. 09)
                    year: 'numeric'    // Año con cuatro dígitos (e.g. 2024)
                });
                const table = App.elements.table;

                const rowFinal = document.createElement('tr');
                rowFinal.classList.add('p-small');
                rowFinal.innerHTML = `
                    <td>Fecha: ${fechaFormateada}</td>
                    <td></td>
                    <td>Actualizado hace 5 min</td>
                `;

                table.appendChild(rowFinal);
            }
        }
    };

    App.init();
})();



