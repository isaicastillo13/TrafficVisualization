(() => {
    const App = {
        HTMLElements: {
            htmlDocument: document,
            timeArrivalInformation: document.querySelector('.timeArrivalInformation')
        },
        data: {
            destinations:["Trebol Vista Hermosa", "Zona Pradera", "Campo Marte", "Obelisco", "El Trébol"]
        },
        init() {
            App.bindEvents();
        },
        bindEvents() {
            App.HTMLElements.htmlDocument.addEventListener('DOMContentLoaded', App.handlers.getDataApi);
        },
        handlers: {
            getDataApi() {
                App.methods.getDataApiWaze();
            }
        },
        methods: {
            async getDataApiWaze() {
                const alternatives = "driving-traffic"
                const startingPoint = "-90.48274768383342,14.575241689499608" 
                const destino1= "-90.48255494006219,14.58062188262523"
                const destino2= "-90.49580300770202,14.581844067578363"
                const destino3= "-90.50523044413639,14.614838979358003"
                const destino4= "-90.51721256901712,14.59455484436563" 
                const destino5= "-90.5273924976389,14.602609766201812"
                const apiKey = "pk.eyJ1IjoiaXNhaWNhc3RpbGxvIiwiYSI6ImNsd3o4Y2U4dTA0c2EyanB5a3JxaW0zeGwifQ.0vMwUPTDeeX5hU232bo2UQ"

      
            url=`https://api.mapbox.com/directions-matrix/v1/mapbox/${alternatives}/${startingPoint};${destino1};${destino2};${destino3};${destino4};${destino5}?sources=0&access_token=${apiKey}`

                fetch(url)
                .then(response => response.json())
                .then(data => {
                    App.methods.getTimeArrival(data)
                    console.log(data)
                })
                .catch(error => {
                    console.error("Error: ", error);
                    setTimeout(App.methods.getDataApiWaze, 60000);
                })
            
            },
            getTimeArrival(data) {
                const time = data.durations[0]
                for(let key  in time){
                    const timeMinutes = Math.round(time[key] / 60)
                    if(key != 0){
                        App.methods.render(timeMinutes)
                    }
                }
            },
            render(timeMinutes) { 
                const timeArrivalInformation = App.HTMLElements.timeArrivalInformation
                // Traigo los destinos desde mi arreglo de datos
                const destinations = App.data.destinations
                // cada vez que se ejecuta el render se va a borrar el primer elemento de mi arreglo
                const destination = destinations.shift()
                const timeArrival = timeMinutes
                const timeArrivalElement = document.createElement('div')
                timeArrivalElement.classList.add('info__destination')

                timeArrivalElement.innerHTML = `
                <p class="destination__txt">${destination}</p>
                <p class="info__estimateTime">${timeArrival} Min</p>`

                timeArrivalInformation.appendChild(timeArrivalElement)
            }
        }

    }

    App.init();

})();