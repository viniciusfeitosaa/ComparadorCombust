document.getElementById('form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const cidade = document.getElementById('cidade').value;
    const gasolina = document.getElementById('gasolina').value;
    const etanol = document.getElementById('etanol').value;
    
    fetch(`/api/combustivel?cidade=${cidade}&gasolina=${gasolina}&etanol=${etanol}`)
        .then(response => response.json())
        .then(data => {
            let resultado = `<h2>Combustível mais econômico: ${data.combustivel_mais_economico}</h2>`;
            document.getElementById('resultado').innerHTML = resultado;

            // Salva as coordenadas da cidade
            let lat = data.latitude;
            let lon = data.longitude;

            // Função para buscar postos de combustível próximos
            function buscarPostos(lat, lon) {
                const map = new google.maps.Map(document.getElementById('map'), {
                    center: { lat: lat, lng: lon },
                    zoom: 12
                });

                fetch(`/api/postosproximos?lat=${lat}&lon=${lon}`)
                    .then(response => response.json())
                    .then(data => {
                        let postos = '<h3>Postos de Combustíveis Próximos:</h3>';
                        data.postos.forEach(posto => {
                            postos += `<p>${posto.nome}: ${posto.endereco}</p>`;

                            // Adiciona marcadores no mapa
                            const marker = new google.maps.Marker({
                                position: { lat: posto.lat, lng: posto.lon },
                                map: map,
                                title: posto.nome
                            });
                        });
                        document.getElementById('postos').innerHTML = postos;
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        document.getElementById('postos').innerHTML = `<p>Ocorreu um erro ao obter os dados dos postos. Tente novamente mais tarde.</p>`;
                    });
            }

            // Mostra o botão para buscar postos próximos e solicita a localização do usuário
            const buscarPostosBtn = document.getElementById('buscarPostos');
            buscarPostosBtn.style.display = 'block';

            buscarPostosBtn.addEventListener('click', function() {
                document.getElementById('map').style.display = 'block';

                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(position => {
                        lat = position.coords.latitude;
                        lon = position.coords.longitude;
                        buscarPostos(lat, lon);
                    }, error => {
                        console.error('Geolocalização não permitida ou indisponível.', error);
                        buscarPostos(lat, lon); // Utiliza as coordenadas da cidade como fallback
                    });
                } else {
                    console.error('Geolocalização não suportada pelo navegador.');
                    buscarPostos(lat, lon); // Utiliza as coordenadas da cidade como fallback
                }
            });
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('resultado').innerHTML = `<p>Ocorreu um erro ao obter os dados. Tente novamente mais tarde.</p>`;
        });
});
