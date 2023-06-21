const express = require('express');
const app = express();
const axios = require('axios');
const fs = require('fs');
const PORT = 3000;

app.use(express.json());

app.post('/api/lien', async (req, res) => {
  const { lien } = req.body;
  console.log('Lien reçu depuis l\'application :', lien);

  try {
    // Effectuer une requête HTTP à l'API
    const response = await axios.get(lien);

    // Enregistrer les données dans un fichier JSON
    const data = response.data.results[0];

    fs.readFile('donnees.json', 'utf8', (err, fileData) => {
      if (err) {
        console.error('Erreur lors de la lecture du fichier JSON :', err);
        res.status(500).json({ error: 'Erreur lors de la lecture des données' });
      } else {
        let donnees = [];
        try {
          donnees = JSON.parse(fileData);
          // Assurez-vous que les données sont un tableau
          if (!Array.isArray(donnees)) {
            donnees = [];
          }
        } catch (err) {
          console.error('Erreur lors de la conversion des données JSON :', err);
        }
        donnees.push(data);

        fs.writeFile('donnees.json', JSON.stringify(donnees), (err) => {
          if (err) {
            console.error('Erreur lors de l\'enregistrement des données :', err);
            res.status(500).json({ error: 'Erreur lors de l\'enregistrement des données' });
          } else {
            console.log('Données enregistrées avec succès dans le fichier donnees.json');
            res.json({ message: 'Lien reçu avec succès et données enregistrées' });
          }
        });
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des données depuis l\'API :', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des données depuis l\'API' });
  }
});

app.get('/api/donnees', (req, res) => {
  fs.readFile('donnees.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Erreur lors de la lecture du fichier JSON :', err);
      res.status(500).json({ error: 'Erreur lors de la lecture des données' });
    } else {
      const donnees = JSON.parse(data);
      res.json(donnees);
    }
  });
});

app.listen(PORT, () => {
  console.log(`Serveur backend en cours d'exécution sur le port ${PORT}`);
});
