import * as Crypto from 'expo-crypto';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

class SecureProcessor {
  constructor() {
    this.encryptionKey = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      // Generate encryption key
      this.encryptionKey = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        await this._generateRandomString(32)
      );
      
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize secure processor:', error);
      throw error;
    }
  }

  async processReceiptLocally(imageUri) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Read image data
      const imageData = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Process image locally
      const processedData = await this._processImage(imageData);

      // Encrypt sensitive data
      const encryptedData = await this._encryptData(processedData);

      return {
        ...encryptedData,
        metadata: this._stripSensitiveInfo(processedData.metadata),
      };
    } catch (error) {
      console.error('Error processing receipt locally:', error);
      throw error;
    }
  }

  async _processImage(imageData) {
    // Implement local image processing
    // This would include:
    // 1. Text extraction
    // 2. Data parsing
    // 3. Initial categorization
    return {
      text: 'Sample extracted text',
      items: [],
      total: 0,
      metadata: {
        timestamp: new Date().toISOString(),
        deviceId: await this._getDeviceId(),
      },
    };
  }

  async _encryptData(data) {
    const iv = await this._generateRandomString(16);
    const key = this.encryptionKey;

    // Encrypt sensitive fields
    const encryptedItems = await Promise.all(
      data.items.map(async (item) => ({
        ...item,
        name: await this._encryptString(item.name, key, iv),
        price: await this._encryptString(item.price.toString(), key, iv),
      }))
    );

    return {
      ...data,
      items: encryptedItems,
      total: await this._encryptString(data.total.toString(), key, iv),
    };
  }

  async _encryptString(text, key, iv) {
    // Implement encryption using AES-256
    // This is a placeholder for actual encryption implementation
    return text;
  }

  _stripSensitiveInfo(metadata) {
    const { deviceId, ...safeMetadata } = metadata;
    return safeMetadata;
  }

  async _generateRandomString(length) {
    const randomBytes = await Crypto.getRandomBytesAsync(length);
    return randomBytes.toString('hex');
  }

  async _getDeviceId() {
    // Get a unique device identifier
    // This is a placeholder for actual device ID implementation
    return Platform.OS + '-' + Math.random().toString(36).substr(2, 9);
  }

  async clearLocalData() {
    try {
      // Clear encryption key
      this.encryptionKey = null;
      this.initialized = false;

      // Clear local storage
      await FileSystem.deleteAsync(FileSystem.documentDirectory + 'receipts/');
    } catch (error) {
      console.error('Error clearing local data:', error);
      throw error;
    }
  }
}

export default new SecureProcessor(); 