import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';

const HomeScreen = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scannedReceipts, setScannedReceipts] = useState([]);
  const [loading, setLoading] = useState(false);

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      processReceipt(result.assets[0].uri);
    }
  };

  const processReceipt = async (imageUri) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'receipt.jpg',
      });

      const response = await fetch('http://localhost:8000/scan', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();
      setScannedReceipts([...scannedReceipts, data]);
    } catch (error) {
      console.error('Error processing receipt:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reciply</Text>
        <Text style={styles.subtitle}>Smart Receipt Scanner</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.button}
          onPress={pickImage}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Processing...' : 'Scan Receipt'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.receipts}>
        {scannedReceipts.map((receipt, index) => (
          <View key={index} style={styles.receiptCard}>
            <Text style={styles.merchant}>{receipt.merchant}</Text>
            <Text style={styles.date}>
              {new Date(receipt.date).toLocaleDateString()}
            </Text>
            <Text style={styles.total}>Total: ${receipt.total.toFixed(2)}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#4CAF50',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    marginTop: 5,
  },
  actions: {
    padding: 20,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  receipts: {
    flex: 1,
    padding: 20,
  },
  receiptCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  merchant: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  date: {
    color: '#666',
    marginTop: 5,
  },
  total: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
    color: '#4CAF50',
  },
});

export default HomeScreen; 