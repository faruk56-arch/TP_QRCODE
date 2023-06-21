import React, { useState, useEffect, useRef } from 'react';
import { Text, View, StyleSheet, Button, FlatList } from 'react-native';
import { Camera } from 'expo-camera';
import axios from 'axios';

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanEnabled, setScanEnabled] = useState(false);
  const [userData, setUserData] = useState([]);

  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ data }) => {
    setScanEnabled(false);
    alert(`Code QR scanné : ${data}`);

    try {
      await axios.post('http://10.74.0.145:3000/api/lien', {
        lien: data,
      });
      alert('Lien envoyé avec succès à votre backend !');
      fetchData();
    } catch (error) {
      console.log('Erreur lors de l\'envoi du lien au backend :', error);
      alert('Une erreur s\'est produite lors de l\'envoi du lien au backend.');
    }
  };

  const fetchData = async () => {
    try {
      const response = await axios.get('http://10.74.0.145:3000/api/donnees');
      setUserData(response.data);
      console.log('Données récupérées depuis le backend :', response.data);
    } catch (error) {
      console.log('Erreur lors de la récupération des données depuis le backend :', error);
    }
  };

  const openScanner = () => {
    setScanEnabled(true);
  };

  const closeScanner = () => {
    setScanEnabled(false);
  };

  if (hasPermission === null) {
    return <Text>Demande d'autorisation de la caméra...</Text>;
  }
  if (hasPermission === false) {
    return <Text>Pas d'accès à la caméra</Text>;
  }

  return (
    <View style={styles.container}>
      {!scanEnabled ? (
        <>
          <View style={styles.buttonContainer}>
            <Button title="Ouvrir le scan" onPress={openScanner} />
          </View>
          <View style={styles.userListContainer}>
            <FlatList
              data={userData}
              renderItem={({ item }) => (
                <View style={styles.userItem}>
                  <Text style={styles.userName}>{`${item.name.first} ${item.name.last}`}</Text>
                  <Text style={styles.userGender}>{item.gender}</Text>
                  <Text style={styles.userLocation}>{`${item.location.city}, ${item.location.country}`}</Text>
                </View>
              )}
              keyExtractor={(item, index) => index.toString()}
            />

          </View>
        </>
      ) : (
        <>
          <Camera
            style={styles.camera}
            type={Camera.Constants.Type.back}
            onBarCodeScanned={handleBarCodeScanned}
            ref={cameraRef}
          />
          <View style={styles.buttonContainer}>
            <Button title="Fermer le scan" onPress={closeScanner} />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  userListContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  userItem: {
    marginBottom: 16,
  },
  userName: {
    fontSize: 16,
    marginVertical: 5,
    color: '#fff',
  },
  userGender: {
    fontSize: 14,
    color: '#fff',
  },
  userLocation: {
    fontSize: 14,
    color: '#fff',
  },
});
