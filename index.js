// Exemplo de código de servidor Node.js usando o pacote axios
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

app.use(cors());
const port = process.env.PORT ? Number(process.env.PORT) : 3001

const apiKey = 'AIzaSyBQjCFsubPj4n64oX5d9QeUQiJO5EkxTRA'
const placeId = 'ChIJD9oZj8H5sgcRDqC1udkeumQ'

app.get('/reviews', async (req, res) => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeId}&key=${apiKey}&fields=reviews`,
      {
        headers: {
          'Access-Control-Allow-Origin': '*'
        }
      }
    );

    const reviews = response.data.result.reviews;
    res.json(reviews);
  } catch (error) {
    console.error('Erro ao buscar avaliações:', error);
    res.status(500).json({ error: 'Erro ao buscar avaliações' });
  }
});

app.listen(port, () => {
  console.log('Servidor está ouvindo na porta 3001');
});
