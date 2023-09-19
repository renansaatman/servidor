// Exemplo de código de servidor Node.js usando o pacote axios
const express = require('express');
const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();

app.use(cors());
const port = process.env.PORT ? Number(process.env.PORT) : 3001

const apiKey = 'AIzaSyBQjCFsubPj4n64oX5d9QeUQiJO5EkxTRA'
const placeId = 'ChIJD9oZj8H5sgcRDqC1udkeumQ'

const db = new sqlite3.Database('avaliacoes.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY,
      author_name TEXT,
      rating INTEGER,
      text TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

app.get('/reviews', async (req, res) => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    db.get('SELECT * FROM reviews WHERE timestamp > ?', oneWeekAgo.getTime(), async (err, row) => {
      if (err) {
        console.error('Erro ao verificar as avaliações no banco de dados:', err);
        return res.status(500).json({ error: 'Erro ao buscar avaliações' });
      }

      if (row && row.reviews) { // Verificar se row.reviews existe
        // Avaliações encontradas no banco de dados, retornar essas avaliações.
        return res.json(JSON.parse(row.reviews));
      } else {
        // Avaliações não encontradas no banco de dados, fazer a requisição para a API do Google.
        const response = await axios.get(
          `https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeId}&key=${apiKey}&fields=reviews&language=pt-BR`,
          {
            headers: {
              'Access-Control-Allow-Origin': '*'
            }
          }
        );
      
        const reviews = response.data.result.reviews;
      
        // Preparar e executar a inserção das avaliações no banco de dados
        const stmt = db.prepare('INSERT INTO reviews (author_name, rating, text, timestamp) VALUES (?, ?, ?, ?)');
      
        for (const review of reviews) {
          stmt.run(review.author_name, review.rating, review.text, Date.now());
        }
      
        stmt.finalize(); // Finalizar a instrução de preparação
        return res.json(reviews);
      }
    });
  } catch (error) {
    console.error('Erro ao buscar avaliações:', error);
    res.status(500).json({ error: 'Erro ao buscar avaliações' });
  }
});


// app.get('/reviews', async (req, res) => {
//   try {
//     const response = await axios.get(
//       `https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeId}&key=${apiKey}&fields=reviews&language=pt-BR`,
//       {
//         headers: {
//           'Access-Control-Allow-Origin': '*'
//         }
//       }
//     );

//     const reviews = response.data.result.reviews;
//     res.json(reviews);
//   } catch (error) {
//     console.error('Erro ao buscar avaliações:', error);
//     res.status(500).json({ error: 'Erro ao buscar avaliações' });
//   }
// });

app.listen(port, () => {
  console.log('Servidor está ouvindo na porta 3001');
});
